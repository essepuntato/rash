package it.unibo.cs.savesd.rash.spar.xtractor.impl;

import it.unibo.cs.savesd.rash.spar.xtractor.Xtractor;
import it.unibo.cs.savesd.rash.spar.xtractor.config.ConfigProperties;
import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCOClass;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import opennlp.tools.sentdetect.SentenceDetector;
import opennlp.tools.sentdetect.SentenceDetectorME;
import opennlp.tools.sentdetect.SentenceModel;
import opennlp.tools.util.InvalidFormatException;

import org.apache.commons.configuration.Configuration;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.parser.Tag;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.Resource;

/**
 * 
 * Basic implementation of the interface {@link XtractorTest}.
 * 
 * @author Andrea Nuzzolese
 *
 */

public class XtractorImpl implements Xtractor {

    private Logger log = LoggerFactory.getLogger(XtractorImpl.class);
    private Configuration configuration;
    
    private final String _SENTENCE_DETECTOR_MODEL_EN_DEFAULT_ = "META-INF/models/en-sent.bin";
    private SentenceDetector sentenceDetector;
    private RDFaInjectorImpl rdFaInjector;
    
    public XtractorImpl(Configuration configuration) {
        this.configuration = configuration;
        rdFaInjector = new RDFaInjectorImpl();
        activate();
    }
    
    protected void activate(){
        SentenceModel model = null;
        InputStream modelIn = null;
        String sentenceDetectorModelEn = configuration.getString(ConfigProperties.SENTENCE_DETECTOR_MODEL_EN);
        if(sentenceDetectorModelEn == null || sentenceDetectorModelEn.isEmpty()){
            modelIn = getClass().getClassLoader().getResourceAsStream(_SENTENCE_DETECTOR_MODEL_EN_DEFAULT_);
        }
        else{
            try {
                modelIn = new FileInputStream(sentenceDetectorModelEn);
            } catch (FileNotFoundException e) {
                log.error("An error occurred while loading the sentence model.", e);
            }
        }
        
        if(modelIn != null){
            try {
                model = new SentenceModel(modelIn);
            } catch (InvalidFormatException e) {
                log.error("The model for sentence detection provided is in an invalid format.", e);
            } catch (IOException e) {
                log.error("An IO Exception occurred while loading the model for sentence detection.", e);
            }  
            if(model != null) sentenceDetector = new SentenceDetectorME(model);
        }
        
        String namespace = configuration.getString(ConfigProperties.NAMESPACE);
        if(namespace == null)configuration.setProperty(ConfigProperties.NAMESPACE, "");
    }
    
    @Override
    public void extract(String path) throws MalformedURLException {
        Document doc = null;
        if(path != null && !path.isEmpty()){
            if(path.startsWith("http://")){
                URL url = new URL(path);
                try {
                    doc = Jsoup.parse(url, 10000);
                } catch (IOException e) {
                    log.error("An error occurred while parsing the document from a remote endpoint.", e);
                }
            }
            else doc = Jsoup.parse(path, null);
        }
        
        if(doc != null){
            Elements paragraphs = getParagraphs(doc);
            for(Element paragraph : paragraphs){
                String text = paragraph.text();
                if(text != null && !text.isEmpty()){
                    String[] sentences = detectSentences(text);
                }
            }
                
        }
    }
    
    public void createBodyMatter(Document document){
        
        String namespace = configuration.getString(ConfigProperties.NAMESPACE);
        String namingBodyMatter = configuration.getString(ConfigProperties.NAMING_BODY_MATTER);
        
        RDFaInjectorImpl rdFaInjector = new RDFaInjectorImpl();
        
        /*
         * Add the doco:BodyMatter
         */
        Model model = ModelFactory.createDefaultModel();
        Resource bodyResource = model.createResource(namespace + namingBodyMatter);
        Element body = document.body();
        rdFaInjector.createDoCOElement(body, bodyResource, DoCOClass.BodyMatter);
    }
    
    @Override
    public void createSections(Document document){
        
        
        Elements paragraphs = getParagraphs(document);
        
        String namespace = configuration.getString(ConfigProperties.NAMESPACE);
        String paragraphNaming = configuration.getString(ConfigProperties.NAMING_PARAGRAPH);
        
        RDFaInjectorImpl rdFaInjector = new RDFaInjectorImpl();
        
        Element body = document.body();
        
        /*
         * Iterate body's children in order to detect divs that represent sections.
         */
        Elements bodyChildren = body.children();
        
        Model model = ModelFactory.createDefaultModel();
        Property contains = model.createProperty("http://www.essepuntato.it/2008/12/pattern#contains");
        int sections = 0;
        for(Element bodyChild : bodyChildren){
            if(bodyChild.nodeName().equalsIgnoreCase(configuration.getString(ConfigProperties.HTML_ELEMENT_SECTION))){
                if(bodyChild.hasClass("section")){
                    sections += 1;
                    Resource sectionResource = model.createResource(namespace + paragraphNaming + "-" + sections);
                    rdFaInjector.createDoCOElement(bodyChild, contains, sectionResource, DoCOClass.Section);
                }
            }
        }
        
    }
    
    @Override
    public void createSections(Element body, Document document){
        
        String namespace = configuration.getString(ConfigProperties.NAMESPACE);
        String paragraphNaming = configuration.getString(ConfigProperties.NAMING_PARAGRAPH);
        
        /*
         * Iterate body's children in order to detect divs that represent sections.
         */
        Elements bodyChildren = body.children();
        
        Model model = ModelFactory.createDefaultModel();
        Property contains = model.createProperty("http://www.essepuntato.it/2008/12/pattern#contains");
        int sections = 0;
        for(Element bodyChild : bodyChildren){
            if(bodyChild.nodeName().equalsIgnoreCase(configuration.getString(ConfigProperties.HTML_ELEMENT_SECTION))){
                if(bodyChild.hasClass("section")){
                    sections += 1;
                    Resource sectionResource = model.createResource(namespace + paragraphNaming + "-" + sections);
                    rdFaInjector.createDoCOElement(bodyChild, contains, sectionResource, DoCOClass.Section);
                }
            }
        }
        
    }

    @Override
    public void createParagraphs(Document document){
        
        String namespace = configuration.getString(ConfigProperties.NAMESPACE);
        String sectionNaming = configuration.getString(ConfigProperties.NAMING_SECTION);
        String paragraphNaming = configuration.getString(ConfigProperties.NAMING_PARAGRAPH);
        
        RDFaInjectorImpl rdFaInjector = new RDFaInjectorImpl();
        
        Element body = document.body();
        
        /*
         * Iterate body's children in order to detect divs that represent sections.
         */
        Elements bodyChildren = body.children();
        
        Model model = ModelFactory.createDefaultModel();
        Property contains = model.createProperty("http://www.essepuntato.it/2008/12/pattern#contains");
        int sections = 0;
        for(Element section : bodyChildren){
            if(section.nodeName().equalsIgnoreCase(configuration.getString(ConfigProperties.HTML_ELEMENT_SECTION))){
                if(section.hasClass("section")){
                    sections += 1;
                    
                    Elements paragraphElements = section.children();
                    
                    int paragraphs = 0;
                    for(Element paragraph : paragraphElements){
                        if(paragraph.nodeName().equalsIgnoreCase(configuration.getString(ConfigProperties.HTML_ELEMENT_PARAGRAPH))){
                            paragraphs += 1;
                            String uri = namespace + sectionNaming + "-" + sections + "/" + paragraphNaming + "-" + paragraphs;
                            Resource paragraphResource = model.createResource(uri);
                            rdFaInjector.createDoCOElement(paragraph, contains, paragraphResource, DoCOClass.Paragraph);
                        }
                    }
                }
            }
        }
        
    }
    
    @Override
    public void createParagraphs(Element section, Document document){
        
        String namespace = configuration.getString(ConfigProperties.NAMESPACE);
        String sectionNaming = configuration.getString(ConfigProperties.NAMING_SECTION);
        String paragraphNaming = configuration.getString(ConfigProperties.NAMING_PARAGRAPH);
        
        String sectionUri = section.attr("resource");
        if(sectionUri == null) sectionUri = namespace + sectionNaming;
        
        Model model = ModelFactory.createDefaultModel();
        Property contains = model.createProperty("http://www.essepuntato.it/2008/12/pattern#contains");
        Elements paragraphElements = section.children();
                    
        int paragraphs = 0;
        for(Element paragraph : paragraphElements){
            if(paragraph.nodeName().equalsIgnoreCase(configuration.getString(ConfigProperties.HTML_ELEMENT_PARAGRAPH))){
                paragraphs += 1;
                String uri = sectionUri + "/" + paragraphNaming + "-" + paragraphs;
                Resource paragraphResource = model.createResource(uri);
                rdFaInjector.createDoCOElement(paragraph, contains, paragraphResource, DoCOClass.Paragraph);
            }
        }
        
    }
    
    @Override
    public void createSentences(Document document){
        
        String namespace = configuration.getString(ConfigProperties.NAMESPACE);
        String sectionNaming = configuration.getString(ConfigProperties.NAMING_SECTION);
        String paragraphNaming = configuration.getString(ConfigProperties.NAMING_PARAGRAPH);
        String sentenceNaming = configuration.getString(ConfigProperties.NAMING_SENTENCE);
        
        Element body = document.body();
        
        /*
         * Iterate body's children in order to detect divs that represent sections.
         */
        Elements bodyChildren = body.children();
        
        Model model = ModelFactory.createDefaultModel();
        Property contains = model.createProperty("http://www.essepuntato.it/2008/12/pattern#contains");
        Property hasContent = model.createProperty("http://purl.org/spar/c4o/hasContent");
        int sections = 0;
        for(Element section : bodyChildren){
            if(section.nodeName().equalsIgnoreCase(configuration.getString(ConfigProperties.HTML_ELEMENT_SECTION))){
                if(section.hasClass("section")){
                    sections += 1;
                    
                    Elements paragraphElements = getParagraphs(section, document);
                    
                    int paragraphs = 0;
                    for(Element paragraph : paragraphElements){
                        if(paragraph.nodeName().equalsIgnoreCase(configuration.getString(ConfigProperties.HTML_ELEMENT_PARAGRAPH))){
                            paragraphs += 1;
                            
                            String text = paragraph.html();
                            paragraph = paragraph.html("");
                            String[] sentences = detectSentences(text);
                            for(int i=0; i<sentences.length; i++){
                                String uri = namespace + sectionNaming + "-" + sections + "/" + paragraphNaming + "-" + paragraphs + "/" + sentenceNaming + "-" + (i+1);
                                Resource sentenceResource = model.createResource(uri);
                                
                                Element span = rdFaInjector.appendDoCOElement(paragraph, Tag.valueOf("span"), contains, sentenceResource, DoCOClass.Sentence);
                                Element contentSpan = rdFaInjector.appendDoCOElement(span, Tag.valueOf("span"), hasContent);
                                
                                contentSpan.html(sentences[i]);    
                            }
                            
                        }
                    }
                }
            }
        }
        
    }
    
    @Override
    public void createSentences(Element paragraph, Document document){
        
        String namespace = configuration.getString(ConfigProperties.NAMESPACE);
        String sectionNaming = configuration.getString(ConfigProperties.NAMING_SECTION);
        String paragraphNaming = configuration.getString(ConfigProperties.NAMING_PARAGRAPH);
        String sentenceNaming = configuration.getString(ConfigProperties.NAMING_SENTENCE);
        
        String paragraphUri = paragraph.attr("resource");
        if(paragraphUri == null) paragraphUri = namespace + sectionNaming + "/" + paragraphNaming;
        
        Model model = ModelFactory.createDefaultModel();
        
        Property contains = model.createProperty("http://www.essepuntato.it/2008/12/pattern#contains");
        Property hasContent = model.createProperty("http://purl.org/spar/c4o/hasContent");
        String text = paragraph.html();
        paragraph.html("");
        String[] sentences = detectSentences(text);
        for(int i=0; i<sentences.length; i++){
            String uri = paragraphUri + "/" + sentenceNaming + "-" + (i+1);
            Resource sentenceResource = model.createResource(uri);
            
            Element span = rdFaInjector.appendDoCOElement(paragraph, Tag.valueOf("span"), contains, sentenceResource, DoCOClass.Sentence);
            Element contentSpan = rdFaInjector.appendDoCOElement(span, Tag.valueOf("span"), hasContent);
            
            contentSpan.html(sentences[i]);
            
        }
        
    }
    
    private String[] detectSentences(String text){
        return sentenceDetector.sentDetect(text);
    }
    
    private Elements getParagraphs(Document document){
        
        String sectionElement = configuration.getString(ConfigProperties.HTML_ELEMENT_SECTION);
        String paragraphElement = configuration.getString(ConfigProperties.HTML_ELEMENT_PARAGRAPH);
        List<Object> ignoreClasses = configuration.getList(ConfigProperties.HTML_IGNORE_CLASS);
        
        
        
        Elements pElements = new Elements();
        // Get all DIV elements.
        Elements divs = document.getElementsByTag(sectionElement);
        
        // Traverse all DIV elements.
        for(Element div : divs){
            
            
            Elements ps = div.children();
            for(Element p : ps){
                if(p.nodeName().equalsIgnoreCase(paragraphElement)){
                    boolean validParagraph = true;
                    
                    for(int i=0, j=ignoreClasses.size(); i<j && validParagraph; i++){
                        Object ignoreClass = ignoreClasses.get(i);
                        if(ignoreClass instanceof String && p.hasClass((String)ignoreClass))
                            validParagraph = false;
                    }
                    
                    if(validParagraph){
                        pElements.add(p);
                    }
                }
            }
        }
        
        return pElements;
    }
    
    private Elements getParagraphs(Element section, Document document){
        
        String sectionElement = configuration.getString(ConfigProperties.HTML_ELEMENT_SECTION);
        String paragraphElement = configuration.getString(ConfigProperties.HTML_ELEMENT_PARAGRAPH);
        List<Object> ignoreClasses = configuration.getList(ConfigProperties.HTML_IGNORE_CLASS);
        
        Elements pElements = new Elements();
            
        Elements ps = section.children();
        for(Element p : ps){
            if(p.nodeName().equalsIgnoreCase(paragraphElement)){
                boolean validParagraph = true;
                
                for(int i=0, j=ignoreClasses.size(); i<j && validParagraph; i++){
                    Object ignoreClass = ignoreClasses.get(i);
                    if(ignoreClass instanceof String && p.hasClass((String)ignoreClass))
                        validParagraph = false;
                }
                
                if(validParagraph){
                    pElements.add(p);
                }
            }
        }
        return pElements;
    }
    
    public static void main(String[] args) {
        
    }
}
