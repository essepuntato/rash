package xyz.illbe.docx2rash;

import net.sf.saxon.TransformerFactoryImpl;
import org.apache.commons.io.FileUtils;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.*;
import java.util.zip.ZipInputStream;

/**
 * Applies an XSLT stylesheet to an XML file
 */
public class XSLT {

    public XSLT() {
        final String ZIP_PATH = "docx" + File.separator + "testbed-4.docx";
        final String XSLT_PATH = "xslt" + File.separator + "from-docx.xsl";
        final String OUTPUT_DIR = "output";
        final String OUTPUT_HTML = OUTPUT_DIR + File.separator + "out.html";
        final String WORKING_DIR = "workingdir";
        File output = new File(OUTPUT_HTML);
        ClassLoader cl = this.getClass().getClassLoader();
        StreamSource xsltStream = new StreamSource(cl.getResourceAsStream(XSLT_PATH));
        TransformerFactory tFactory = TransformerFactoryImpl.newInstance("net.sf.saxon.TransformerFactoryImpl", null);
        Transformer transformer = null;
        System.out.println("Extracting files");
        ZipUtils.unzip(cl.getResource(ZIP_PATH), WORKING_DIR);
        String input = WORKING_DIR + File.separator + "word" + File.separator + "document.xml";
        try {
            transformer = tFactory.newTransformer(xsltStream);
        } catch (TransformerConfigurationException e) {
            e.printStackTrace();
        }
        try {
            if (transformer != null) {
                System.out.println("Applying xslt");
                transformer.transform(
                        new StreamSource(new FileInputStream(input)),
                        new StreamResult(new FileOutputStream(output))
                );
            } else {
                throw new Exception("Tasnd");
            }
        } catch (TransformerException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        File outputDir = new File(WORKING_DIR);
        try {
            FileUtils.deleteDirectory(outputDir);
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            FileUtils.copyDirectory(new File(cl.getResource("js").getFile()), new File(OUTPUT_DIR + File.separator + "js"));
            FileUtils.copyDirectory(new File(cl.getResource("css").getFile()), new File(OUTPUT_DIR + File.separator + "css"));
        } catch (IOException e) {
            e.printStackTrace();
        }
        if(output.exists())
            System.out.println("FILE converted!");
    }

}
