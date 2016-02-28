package xyz.illbe.docx2rash;

import net.sf.saxon.TransformerFactoryImpl;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;

/**
 * Applies an XSLT stylesheet to an XML file
 */
public class XSLT {

    public XSLT() {
        String INPUT_PATH = "docx/file.xml";
        String XSLT_PATH = "xslt/docx2rash.xslt";
        String OUTPUT_PATH = "output" + File.separator + "out.html";
        File output = new File(OUTPUT_PATH);
        ClassLoader cl = this.getClass().getClassLoader();
        StreamSource xsltStream = new StreamSource(cl.getResourceAsStream(XSLT_PATH));
        TransformerFactory tFactory = TransformerFactoryImpl.newInstance("net.sf.saxon.TransformerFactoryImpl", null);
        Transformer transformer = null;
        try {
            transformer = tFactory.newTransformer(xsltStream);
        } catch (TransformerConfigurationException e) {
            e.printStackTrace();
        }
        try {
            if (transformer != null) {
                transformer.transform(
                        new StreamSource(cl.getResourceAsStream(INPUT_PATH)),
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
        if(output.exists())
            System.out.println("FILE converted!");
    }

}
