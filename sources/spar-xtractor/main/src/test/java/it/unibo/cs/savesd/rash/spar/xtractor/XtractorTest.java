package it.unibo.cs.savesd.rash.spar.xtractor;

import it.unibo.cs.savesd.rash.spar.xtractor.config.ConfigBuilder;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.InvalidDoCOIndividualException;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.MissmatchingDoCOClassDeclarationException;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.NotInstantiableIndividualException;
import it.unibo.cs.savesd.rash.spar.xtractor.impl.XtractorImpl;
import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCOClass;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

import org.apache.commons.configuration.ConfigurationException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author Andrea Nuzzolese
 *
 */

public class XtractorTest {
    
    private final Logger log = LoggerFactory.getLogger(XtractorTest.class);
    
    private static Xtractor xtractor;
    private static Document document;
    
    @BeforeClass
    public static void setUp(){
        try {
            xtractor = new XtractorImpl(ConfigBuilder.init());
            document = Jsoup.parse(new URL("http://cs.unibo.it/save-sd/rash/documentation/index.html"), 10000);
        } catch (ConfigurationException e) {
            Assert.fail("Configuration exception");
        } catch (MalformedURLException e) {
            Assert.fail("Malformed URL");
        } catch (IOException e) {
            Assert.fail("I/O Exception");
        }
    }
    
    @Test
    public void testPrefixes(){
        Map<String,String> prefixes = xtractor.getPrefixes(document);
        for(String prefix : prefixes.keySet()){
            String namespace = prefixes.get(prefix);
        }
    }
    
    /*
    @Test
    public void testParagraphReading(){
        Method method;
        try {
            method = xtractor.getClass().getDeclaredMethod("getParagraphs", Document.class);
            method.setAccessible(true);
            Elements paragraphs = (Elements)method.invoke(xtractor, document);
            for(Element paragraph : paragraphs){
                log.info(paragraph.text());
            }
        } catch (SecurityException e) {
            Assert.fail(e.getMessage());
        } catch (NoSuchMethodException e) {
            Assert.fail(e.getMessage());
        } catch (IllegalArgumentException e) {
            Assert.fail(e.getMessage());
        } catch (IllegalAccessException e) {
            Assert.fail(e.getMessage());
        } catch (InvocationTargetException e) {
            Assert.fail(e.getMessage());
        }
        
        Assert.assertTrue(true);
        
    }
    */
    
    @Test
    public void testSentenceDetection(){
        Method method;
        try {
            method = xtractor.getClass().getDeclaredMethod("detectSentences", String.class);
            method.setAccessible(true);
            String[] sentences = (String[]) method.invoke(xtractor, "Title and subtitle We can specify the title of the paper by using the element title, as shown in the following excerpt. <title>Title of the paper</title> In addition subtitles can be specified as well, by adding the charaters -- and the subtitle text after the text of the main title, as shown in the next excerpt. <title>Title of the paper -- subtitle of the paper</title>");
            for(String sentence : sentences){
                log.info("Sentence: {}", sentence);
            }
        } catch (SecurityException e) {
            Assert.fail(e.getMessage());
        } catch (NoSuchMethodException e) {
            Assert.fail(e.getMessage());
        } catch (IllegalArgumentException e) {
            Assert.fail(e.getMessage());
        } catch (IllegalAccessException e) {
            Assert.fail(e.getMessage());
        } catch (InvocationTargetException e) {
            Assert.fail(e.getMessage());
        } 
        
        Assert.assertTrue(true);
        
    }
    
    @Test
    public void testDoCOBodyMatterGeneration(){
        try {
            xtractor.createBodyMatter(document);
        } catch (InvalidDoCOIndividualException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (MissmatchingDoCOClassDeclarationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (NotInstantiableIndividualException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    @Test
    public void testDoCOSectionsGeneration(){
        try {
            xtractor.createSections(document);
        } catch (InvalidDoCOIndividualException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (MissmatchingDoCOClassDeclarationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (NotInstantiableIndividualException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    @Test
    public void testDoCOParagraphsGeneration(){
        try {
            xtractor.createParagraphs(document);
        } catch (InvalidDoCOIndividualException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (MissmatchingDoCOClassDeclarationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (NotInstantiableIndividualException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
    
    @Test
    public void testDoCOSentencesGeneration(){
        try {
            xtractor.createSentences(document);
        } catch (InvalidDoCOIndividualException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (MissmatchingDoCOClassDeclarationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (NotInstantiableIndividualException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        //System.out.println(document);
    }
    
    @Test
    public void tesExtract(){
        try {
            Document doc = xtractor.extract("http://cs.unibo.it/save-sd/rash/documentation/index.html", DoCOClass.Sentence);
            //System.out.println(doc.html());
        } catch (MalformedURLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
}
