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
import java.util.LinkedList;

/**
 * Applies an XSLT stylesheet to an XML file
 */
public class XSLT {

    private final String XSLT_DIR = "xslt";
    private final String DOCX_XSLT = "from-docx.xsl";
    private final String OMML_XSLT = "omml2mml.xsl";
    private final String WORKING_DIR = ".workingdir";
    private final String JS_RESOURCES_DIR = "js";
    private final String CSS_RESOURCES_DIR = "css";
    private final String FONTS_RESOURCES_DIR = "fonts";
    private final String GRAMMAR_RESOURCES_DIR = "grammar";
    private final String RNG_FILENAME = "rash.rng";

    private File rashDirectory;

    private LinkedList<File> inputFiles = new LinkedList<File>();

    private Transformer transformer;

    public XSLT(String inputFilePath) {
        this.rashDirectory = new File(".").getAbsoluteFile().getParentFile().getParentFile().getParentFile();
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
            File docxXslt = new File(this.rashDirectory, XSLT_DIR + File.separator + DOCX_XSLT);
            File ommlXslt = new File(this.rashDirectory, XSLT_DIR + File.separator + OMML_XSLT);
            File movedDocxXsltFile = new File(WORKING_DIR, "docx2rash.xsl");
            File movedOmmlXsltFile = new File(WORKING_DIR, "omml2mml.xsl");
            try {
                FileUtils.copyFile(docxXslt, movedDocxXsltFile);
                FileUtils.copyFile(ommlXslt, movedOmmlXsltFile);
            } catch (IOException e) {
                System.err.println("Error moving the XSLT files: " + e.getMessage());
            }
            StreamSource xsltStream = new StreamSource(movedDocxXsltFile);
            TransformerFactory tFactory = TransformerFactoryImpl.newInstance("net.sf.saxon.TransformerFactoryImpl", null);
            try {
                transformer = tFactory.newTransformer(xsltStream);
            } catch (TransformerConfigurationException e) {
                System.err.println(e.getMessage());
            }
            unzipDocx(file);
            String input = WORKING_DIR + File.separator + "word" + File.separator + "document.xml";
            File subdirectory = new File(outputDirPath, file.getName().substring(0, file.getName().lastIndexOf(".")));
            boolean createSuccessful = true;
            if (!subdirectory.exists()) {
                createSuccessful = subdirectory.mkdirs();
            }
            if (createSuccessful) {
                File output = new File(subdirectory, file.getName().substring(0, file.getName().lastIndexOf(".")) + ".html");
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

    private void unzipDocx(File docx) {
        try {
            ZipUtils.unzip(docx, WORKING_DIR);
        } catch (ZipException e) {
            System.err.println("Error while unzipping the .docx file" + e.getMessage());
        }
    }

    private void copyResourcesTo(String outputDirPath) {
        try {
            FileUtils.copyDirectory(
                    new File(this.rashDirectory, JS_RESOURCES_DIR),
                    new File(outputDirPath + File.separator + JS_RESOURCES_DIR)
            );
            FileUtils.copyDirectory(
                    new File(this.rashDirectory, CSS_RESOURCES_DIR),
                    new File(outputDirPath + File.separator + CSS_RESOURCES_DIR)
            );
            FileUtils.copyDirectory(
                    new File(this.rashDirectory, FONTS_RESOURCES_DIR),
                    new File(outputDirPath + File.separator + FONTS_RESOURCES_DIR)
            );
            FileUtils.copyFile(
                    new File(this.rashDirectory + File.separator + GRAMMAR_RESOURCES_DIR, RNG_FILENAME),
                    new File(outputDirPath, RNG_FILENAME)
            );
            File imageDir = new File(WORKING_DIR, "word" + File.separator + "media");
            if (imageDir.exists()) {
                FileUtils.copyDirectory(
                        imageDir,
                        new File(outputDirPath + File.separator + "img")
                );
            }
        } catch (IOException e) {
            System.err.println(e.getMessage());
        }
    }

    private void deleteWorkingDir() {
        File outputDir = new File(WORKING_DIR);
        try {
            FileUtils.deleteDirectory(outputDir);
        } catch (IOException e) {
            System.err.println(e.getMessage());
        }
    }

}
