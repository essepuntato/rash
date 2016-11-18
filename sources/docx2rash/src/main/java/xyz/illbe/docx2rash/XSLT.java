package xyz.illbe.docx2rash;

import net.lingala.zip4j.exception.ZipException;
import net.sf.saxon.TransformerFactoryImpl;
import org.apache.commons.io.FileUtils;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.*;
import java.net.URISyntaxException;
import java.util.Enumeration;
import java.util.LinkedList;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

/**
 * Applies an XSLT stylesheet to an XML file
 */
public class XSLT {

    private final String WORKING_DIR = ".workingdir";
    private final String XSLT_DIR = "xslt";
    private final String JS_RESOURCES_DIR = "js";
    private final String CSS_RESOURCES_DIR = "css";
    private final String FONTS_RESOURCES_DIR = "fonts";
    private final String GRAMMAR_RESOURCES_DIR = "grammar";
    private final String RNG_FILENAME = "rash.rng";
    private final String DOCX_XSLT = "from-docx.xsl";
    private final String OMML_XSLT = "omml2mml.xsl";

    private LinkedList<File> inputFiles = new LinkedList<File>();

    private Transformer transformer;

    public XSLT(String inputFilePath) {
        File inputFile = new File(inputFilePath);
        if (inputFile.isDirectory()) {
        	for(File f : inputFile.listFiles()) {
        		if (f.getName().endsWith(".docx")) {
        			inputFiles.add(f);
        		}
        	}
        } else {
            inputFiles.add(inputFile);
        }
    }

    public void transform(String outputDirPath) throws TransformerException {
        for (File file : inputFiles) {
            File xsltFile = new File(WORKING_DIR, "docx2rash.xsl");
            try {
                if (isJar()) {
                    InputStream docxStream = XSLT.class.getClassLoader().getResourceAsStream(XSLT_DIR + File.separator + DOCX_XSLT);
                    InputStream ommlStream = XSLT.class.getClassLoader().getResourceAsStream(XSLT_DIR + File.separator + OMML_XSLT);
                    FileUtils.copyInputStreamToFile(docxStream, xsltFile);
                    FileUtils.copyInputStreamToFile(ommlStream, new File(WORKING_DIR, "omml2mml.xsl"));
                } else {
                    FileUtils.copyFile(
                            new File(XSLT.class.getClassLoader().getResource(XSLT_DIR + File.separator + DOCX_XSLT).toURI()),
                            xsltFile
                    );
                    FileUtils.copyFile(
                            new File(XSLT.class.getClassLoader().getResource(XSLT_DIR + File.separator + OMML_XSLT).toURI()),
                            new File(WORKING_DIR, "omml2mml.xsl")
                    );
                }
            } catch (IOException e) {
                e.printStackTrace();
            } catch (URISyntaxException e) {
                e.printStackTrace();
            }
            StreamSource xsltStream = new StreamSource(xsltFile);
            TransformerFactory tFactory = TransformerFactoryImpl.newInstance("net.sf.saxon.TransformerFactoryImpl", null);
            try {
                transformer = tFactory.newTransformer(xsltStream);
            } catch (TransformerConfigurationException e) {
                System.err.println(e.getMessage());
            }
            unzipDocx(file);
            String input = WORKING_DIR + File.separator + "word" + File.separator + "document.xml";
            String outputSubdirectoryFilename = file.getName().substring(0, file.getName().lastIndexOf("."));
            File subdirectory = new File(outputDirPath, outputSubdirectoryFilename);
            boolean createSuccessful = true;
            if (!subdirectory.exists()) {
                createSuccessful = subdirectory.mkdirs();
            }
            if (createSuccessful) {
                String outputFilename = file.getName().substring(0, file.getName().lastIndexOf(".")) + ".html";
                File output = new File(subdirectory, outputFilename);
                this.copyResourcesTo(subdirectory.getPath());
                try {
                    transformer.transform(
                            new StreamSource(new FileInputStream(input)),
                            new StreamResult(new FileOutputStream(output))
                    );
                } catch (FileNotFoundException e) {
                    System.err.println("File not found: " + e.getMessage());
                }
            } else {
                System.err.println("Can't create directory");
            }
            this.deleteWorkingDir();
        }
    }

    private boolean isJar() {
        final File jarFile = new File(getClass().getProtectionDomain().getCodeSource().getLocation().getPath());
        return jarFile.isFile();
    }

    private void unzipDocx(File docx) {
        try {
            ZipUtils.unzip(docx, WORKING_DIR);
        } catch (ZipException e) {
            System.err.println("Error while unzipping the .docx file" + e.getMessage());
        }
    }

    private void copyResourcesTo(String outputDirPath) {
        try {
            final File jarFile = new File(getClass().getProtectionDomain().getCodeSource().getLocation().getPath());
            if (jarFile.isFile()) {  // Run with JAR file
                final JarFile jar = new JarFile(jarFile);
                final Enumeration<JarEntry> entries = jar.entries();
                while (entries.hasMoreElements()) {
                    final String name = entries.nextElement().getName();
                    if (!name.endsWith("/") && (name.startsWith(CSS_RESOURCES_DIR + "/")
                            || name.startsWith(JS_RESOURCES_DIR + "/")
                            || name.startsWith(FONTS_RESOURCES_DIR + "/")
                    )) {
                        FileUtils.copyInputStreamToFile(
                                XSLT.class.getClassLoader().getResourceAsStream(name),
                                new File(outputDirPath, name)
                        );
                    }
                    if (!name.endsWith("/") && name.startsWith(GRAMMAR_RESOURCES_DIR + "/")) {
                        FileUtils.copyInputStreamToFile(
                                XSLT.class.getClassLoader().getResourceAsStream(name),
                                new File(outputDirPath, name.substring(name.lastIndexOf("/")))
                        );
                    }
                }
                jar.close();
            } else { // Run with Maven
                try {
                    FileUtils.copyDirectory(
                            new File(XSLT.class.getClassLoader().getResource(CSS_RESOURCES_DIR).toURI()),
                            new File(outputDirPath + File.separator + CSS_RESOURCES_DIR)
                    );
                    FileUtils.copyDirectory(
                            new File(XSLT.class.getClassLoader().getResource(JS_RESOURCES_DIR).toURI()),
                            new File(outputDirPath, JS_RESOURCES_DIR)
                    );
                    FileUtils.copyDirectory(
                            new File(XSLT.class.getClassLoader().getResource(FONTS_RESOURCES_DIR).toURI()),
                            new File(outputDirPath, FONTS_RESOURCES_DIR)
                    );
                    FileUtils.copyFile(
                            new File(XSLT.class.getClassLoader().getResource(GRAMMAR_RESOURCES_DIR + File.separator + RNG_FILENAME).toURI()),
                            new File(outputDirPath, RNG_FILENAME)
                    );
                } catch(URISyntaxException e) {
                    e.printStackTrace();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            File imageDir = new File(WORKING_DIR, "word" + File.separator + "media");
            if (imageDir.exists()) {
                FileUtils.copyDirectory(
                        imageDir,
                        new File(outputDirPath + File.separator + "img")
                );
            }
        } catch (IOException e) {
            System.err.println("Error while copying the resources: ");
            e.printStackTrace();
        }
    }

    private void deleteWorkingDir() {
        File outputDir = new File(WORKING_DIR);
        try {
            FileUtils.deleteDirectory(outputDir);
        } catch (IOException e) {
            System.err.println("Error while " + e.getMessage());
        }
    }

}
