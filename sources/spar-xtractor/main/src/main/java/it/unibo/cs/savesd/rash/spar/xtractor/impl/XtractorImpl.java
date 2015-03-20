package it.unibo.cs.savesd.rash.spar.xtractor.impl;

import it.unibo.cs.savesd.rash.spar.xtractor.Xtractor;
import it.unibo.cs.savesd.rash.spar.xtractor.XtractorTest;
import it.unibo.cs.savesd.rash.spar.xtractor.config.ConfigProperties;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.BodyMatter;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.DoCOIndividualBuilder;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.DoCOIndividuals;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.Expression;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.InvalidDoCOIndividualException;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.MissmatchingDoCOClassDeclarationException;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.NotInstantiableIndividualException;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.Paragraph;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.Section;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.Sentence;
import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCOClass;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
    
    /*
     * Namespace
     */
    protected String namespace;
    
    /*
     * HTML elements that can be associated to DoCO objects.
     */
    protected String expressionElement;
    protected String bodyMatterElement;
    protected String sectionElement;
    protected String paragraphElement;
    
    /*
     * Naming conventions
     */
    protected String namingExpression;
    protected String namingBodyMatter;
    protected String namingSection;
    protected String namingParagraph;
    protected String namingSentence;
    
    /*
     * Namespaces and prefixes
     */
    private Map<String,String> prefixes;
    
    public XtractorImpl(Configuration configuration) {
        this.configuration = configuration;
        rdFaInjector = new RDFaInjectorImpl();
        activate();
    }
    
    protected void activate(){
        expressionElement = configuration.getString(ConfigProperties.HTML_ELEMENT_EXPRESSION);
        bodyMatterElement = configuration.getString(ConfigProperties.HTML_ELEMENT_BODY_MATTER);
        sectionElement = configuration.getString(ConfigProperties.HTML_ELEMENT_SECTION);
        paragraphElement = configuration.getString(ConfigProperties.HTML_ELEMENT_PARAGRAPH);
        
        /*
         * Se-up the namespace.
         */
        namespace = configuration.getString(ConfigProperties.NAMESPACE);
        
        /*
         * Set-up the naming conventions.
         */
        namingExpression = configuration.getString(ConfigProperties.NAMING_EXPRESSION);
        namingBodyMatter = configuration.getString(ConfigProperties.NAMING_BODY_MATTER);
        namingSection = configuration.getString(ConfigProperties.NAMING_SECTION);
        namingParagraph = configuration.getString(ConfigProperties.NAMING_PARAGRAPH);
        namingSentence = configuration.getString(ConfigProperties.NAMING_SENTENCE);
        
        /*
         * Set-up the model for sentence detector based on Apache OpenNlp 
         */
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
    public Document extract(String path, DoCOClass level) throws MalformedURLException {
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
            
            try {
                switch (level) {
                    case Expression:
                        createExpression(doc);
                        break;
                    case BodyMatter:
                        createBodyMatter(doc);
                        break;
                    case Section:
                        createSections(doc);
                        break;
                    case Paragraph:
                        createParagraphs(doc);
                        break;
                    case Sentence:
                        createSentences(doc);
                        break;
                    default:
                        createSentences(doc);
                        break;
                }
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
                
            return doc;
        }
        else return null;
    }
    
    @Override
    public Map<String,String> getPrefixes(Document document){
        Map<String,String> prefixes = new HashMap<String,String>();
        
        Elements test = document.getElementsByTag("html");
        if(test != null && test.size() > 0){
            Element html = test.first();
            String prefixString = html.attr("prefix");
            if(prefixString != null && !prefixString.trim().isEmpty()){
                String regex = "((.)+:) ((.)+:\\/\\/(.)+)";
                Pattern pattern = Pattern.compile(regex);
                Matcher matcher = pattern.matcher(prefixString);
                while(matcher.find()){
                    String prefix = matcher.group(1);
                    String namespace  = matcher.group(3);
                    
                    if(prefix != null)
                        prefix = prefix.trim();
                    if(namespace != null)
                        namespace = namespace.trim();
                    
                    prefixes.put(prefix, namespace);
                }
            }
            
        }
        
        
        return prefixes;
    }
    
    @Override
    public Expression createExpression(Document document) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException{
        /*
         * Add the fabio:Expression
         */
        Elements test = document.getElementsByTag(expressionElement);
        if(test != null){
            Element html = test.first();
            Resource expressionResource = ModelFactory.createDefaultModel().createResource(namingExpression);
            rdFaInjector.createDoCOElement(html, expressionResource, DoCOClass.Expression);
            
            if(this.prefixes == null){
                this.prefixes = getPrefixes(document);
            }
            
            return DoCOIndividualBuilder.build(Expression.class, html, prefixes);
        }
        else throw new InvalidDoCOIndividualException();
        
        
    }
    
    public BodyMatter createBodyMatter(Document document) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException {
        
        /*
         * Add the expression.
         */
        
        Expression expression = createExpression(document);
        
        if(expression != null) return createBodyMatter(expression);
        else return null;
        
        
    }
    
    public BodyMatter createBodyMatter(Expression expression) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException {
        
        Element body = expression.asElement().select(" > body").first();
        
        /*
         * Add the doco:BodyMatter
         */
        Model model = ModelFactory.createDefaultModel();
        Property contains = model.createProperty("http://www.essepuntato.it/2008/12/pattern#contains");
        if(body.nodeName().equals(bodyMatterElement)){
            Resource bodyResource = null;
            String bodyID = body.id();
            if(bodyID != null && !bodyID.isEmpty())
                bodyResource = model.createResource(bodyID);
            else{
                bodyResource = model.createResource(namingBodyMatter);
                body.attr("id", namingBodyMatter);
            }
            rdFaInjector.createDoCOElement(body, contains, bodyResource, DoCOClass.BodyMatter);
        }
        
        if(this.prefixes == null){
            this.prefixes = getPrefixes(body.ownerDocument());
        }
        return DoCOIndividualBuilder.build(BodyMatter.class, body, prefixes);
        
    }
    
    @Override
    public DoCOIndividuals<Section> createSections(Document document) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException {
        
        /*
         * Call createBodyMatter, which in turn calls createExpression. 
         */
        BodyMatter bodyMatter = createBodyMatter(document);
        
        if(bodyMatter != null) return createSections(bodyMatter);
        else return null;
        
    }
    
    public DoCOIndividuals<Section> createSections(BodyMatter bodyMatter) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException {
    
        
        Element body = bodyMatter.asElement();
        
        DoCOIndividuals<Section> sectionIndividuals = new DoCOIndividuals<Section>();
        
        if(this.prefixes == null){
            this.prefixes = getPrefixes(body.ownerDocument());
        }
        
        /*
         * Iterate body's children in order to detect divs that represent sections.
         */
        Elements sectionElements = body.select(" > " + sectionElement + ".section");
        
        Model model = ModelFactory.createDefaultModel();
        Property contains = model.createProperty("http://www.essepuntato.it/2008/12/pattern#contains");
        int sections = 0;
        for(Element section : sectionElements){
            String sectionID = section.id();
            Resource sectionResource = null;
            if(sectionID != null && !sectionID.isEmpty())
                sectionResource = model.createResource(sectionID);
            
            else{
                sectionID = namingParagraph + "-" + sections;
                sectionResource = model.createResource(sectionID);
                section.attr("id", sectionID);
            }
                
            rdFaInjector.createDoCOElement(section, contains, sectionResource, DoCOClass.Section);
            sectionIndividuals.add(DoCOIndividualBuilder.build(Section.class, section, prefixes));
        }
        
        return sectionIndividuals; 
        
    }

    @Override
    public DoCOIndividuals<Paragraph> createParagraphs(Document document) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException {
        
        /*
         * Call createSections, that calls createBodyMatter, which in turn calls createExpression. 
         */
        DoCOIndividuals<Section> sections = createSections(document);
        if(sections != null){
            DoCOIndividuals<Paragraph> paragraphs = new DoCOIndividuals<Paragraph>();
            for(Section section : sections){
                paragraphs.addAll(createParagraphs(section));
            }
            return paragraphs;
        }
        else return null;
    }
    
    @Override
    public DoCOIndividuals<Paragraph> createParagraphs(Section section) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException{
        
        DoCOIndividuals<Paragraph> paragraphIndividuals = new DoCOIndividuals<Paragraph>();
        
        String sectionUri = section.getURI();
        if(sectionUri == null) sectionUri = namingSection;
        
        Model model = ModelFactory.createDefaultModel();
        Property contains = model.createProperty("http://www.essepuntato.it/2008/12/pattern#contains");
        Elements paragraphElements = section.asElement().select(" > " + paragraphElement);
        
        if(this.prefixes == null){
            this.prefixes = getPrefixes(section.asElement().ownerDocument());
        }
                    
        int paragraphs = 0;
        for(Element paragraph : paragraphElements){
            paragraphs += 1;
            
            Resource paragraphResource = null;
            String paragraphID = paragraph.id();
            if(paragraphID != null && !paragraphID.isEmpty())
                paragraphResource = model.createResource(paragraphID);
            else{
                String uri = sectionUri + "/" + namingParagraph + "-" + paragraphs;
                paragraphResource = model.createResource(uri);
                paragraph.attr("id", uri);
            }
            rdFaInjector.createDoCOElement(paragraph, contains, paragraphResource, DoCOClass.Paragraph);
            paragraphIndividuals.add(DoCOIndividualBuilder.build(Paragraph.class, paragraph, prefixes));
        }
        
        return paragraphIndividuals;
        
    }
    
    @Override
    public DoCOIndividuals<Sentence> createSentences(Document document) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException{
        
        /*
         * Call createParagraphs, which recursively calls: 
         *   - createSections; 
         *   - createBodyMatter;
         *   - createExpression. 
         */
        DoCOIndividuals<Paragraph> paragraphs = createParagraphs(document);
        if(paragraphs != null){
            DoCOIndividuals<Sentence> sentences = new DoCOIndividuals<Sentence>();
            for(Paragraph paragraph : paragraphs){
                sentences.addAll(createSentences(paragraph));
            }
            return sentences;
        }
        else return null;
        
    }
    
    @Override
    public DoCOIndividuals<Sentence> createSentences(Paragraph paragraph) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException {
        
        DoCOIndividuals<Sentence> sentenceIndividuals = new DoCOIndividuals<Sentence>();
        
        String paragraphUri = paragraph.getURI();
        if(paragraphUri == null) paragraphUri = namespace + namingSection + "/" + namingParagraph;
        
        Model model = ModelFactory.createDefaultModel();
        
        Property contains = model.createProperty("http://www.essepuntato.it/2008/12/pattern#contains");
        Property hasContent = model.createProperty("http://purl.org/spar/c4o/hasContent");
        
        if(this.prefixes == null){
            this.prefixes = getPrefixes(paragraph.asElement().ownerDocument());
        }
        
        Element paragraphElement = paragraph.asElement();
        String text = paragraphElement.html();
        paragraphElement.html("");
        String[] sentences = detectSentences(text);
        for(int i=0; i<sentences.length; i++){
            String uri = paragraphUri + "/" + namingSentence + "-" + (i+1);
            Resource sentenceResource = model.createResource(uri);
            
            Element span = rdFaInjector.appendDoCOElement(paragraphElement, Tag.valueOf("span"), contains, sentenceResource, DoCOClass.Sentence);
            Element contentSpan = rdFaInjector.appendDoCOElement(span, Tag.valueOf("span"), hasContent);
            
            contentSpan.html(sentences[i]);
            
            sentenceIndividuals.add(DoCOIndividualBuilder.build(Sentence.class, span, prefixes));
            
        }
        
        return sentenceIndividuals;
        
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
