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

/**
 * Applies an XSLT stylesheet to an XML file
 */
public class XSLT {

    private final String XSLT_PATH = "xslt" + File.separator + "from-docx.xsl";
//    private final String XSLT_PATH = "xslt" + File.separator + "omml2mml.xsl";
    private final String WORKING_DIR = "workingdir";
    private final String JS_RESOURCES_DIR = "js";
    private final String CSS_RESOURCES_DIR = "css";

    private File rashDirectory;

    private String outputFilename;

    private ClassLoader classLoader;
    private Transformer transformer;

    public XSLT(String inputFilePath) {
        this.rashDirectory = new File(".").getAbsoluteFile().getParentFile().getParentFile().getParentFile();
        String inputFilename = new File(inputFilePath).getName();
        this.outputFilename = inputFilename.substring(0, inputFilename.lastIndexOf(".")) + ".html";
        File inputFile = new File(inputFilePath);
//        TODO: Processare tutti i file nella directory
//        if (inputFile.isDirectory()) {
//
//        }
        File xsltFile = new File(this.rashDirectory, XSLT_PATH);
        File movedXsltFile = new File("docx.xslt");
        try {
            FileUtils.copyFile(xsltFile, movedXsltFile);
        } catch (IOException e) {
            System.err.println(e.getMessage());
        }
        classLoader = this.getClass().getClassLoader();
        StreamSource xsltStream = new StreamSource(movedXsltFile);
        // StreamSource xsltStream = new StreamSource(classLoader.getResourceAsStream(XSLT_PATH));
        TransformerFactory tFactory = TransformerFactoryImpl.newInstance("net.sf.saxon.TransformerFactoryImpl", null);
        try {
            ZipUtils.unzip(inputFile, WORKING_DIR);
            transformer = tFactory.newTransformer(xsltStream);
        } catch (TransformerConfigurationException e) {
            System.err.println(e.getMessage());
        } catch (ZipException e) {
            System.err.println("Error while unzipping the .docx file" + e.getMessage());
        }
    }

    public void transform(String outputDirPath) {
        String input = WORKING_DIR + File.separator + "word" + File.separator + "document.xml";
        File output = new File(outputDirPath + File.separator + this.outputFilename);
        this.copyResourcesTo(outputDirPath);
        try {
            transformer.transform(
                    new StreamSource(new FileInputStream(input)),
                    new StreamResult(new FileOutputStream(output))
            );
        } catch (TransformerException e) {
            System.err.println(e.getMessage());
        } catch (FileNotFoundException e) {
            System.err.println(e.getMessage());
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
        this.deleteWorkingDir();
    }

    private void copyResourcesTo(String outputDirPath) {
        try {
            FileUtils.copyDirectory(
                    new File(this.rashDirectory, "js"),
                    new File(outputDirPath + File.separator + "js")
            );
            FileUtils.copyDirectory(
                    new File(this.rashDirectory, "css"),
                    new File(outputDirPath + File.separator + "css")
            );
            FileUtils.copyDirectory(
                    new File(this.rashDirectory, "fonts"),
                    new File(outputDirPath + File.separator + "fonts")
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
