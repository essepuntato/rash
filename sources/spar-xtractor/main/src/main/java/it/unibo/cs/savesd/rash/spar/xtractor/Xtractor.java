package it.unibo.cs.savesd.rash.spar.xtractor;

import it.unibo.cs.savesd.rash.spar.xtractor.doco.BodyMatter;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.DoCOIndividuals;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.Expression;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.InvalidDoCOIndividualException;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.MissmatchingDoCOClassDeclarationException;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.NotInstantiableIndividualException;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.Paragraph;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.Section;
import it.unibo.cs.savesd.rash.spar.xtractor.doco.Sentence;
import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCOClass;

import java.net.MalformedURLException;
import java.util.Map;

import org.jsoup.nodes.Document;

public interface Xtractor {
    Document extract(String path, DoCOClass level) throws MalformedURLException;
    Map<String,String> getPrefixes(Document document);
    Expression createExpression(Document document) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException;
    BodyMatter createBodyMatter(Document document) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException;
    BodyMatter createBodyMatter(Expression expression) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException;
    DoCOIndividuals<Section> createSections(Document document) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException;
    DoCOIndividuals<Section> createSections(BodyMatter body) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException;
    DoCOIndividuals<Paragraph> createParagraphs(Document document) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException;
    DoCOIndividuals<Paragraph> createParagraphs(Section section) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException;
    DoCOIndividuals<Sentence> createSentences(Document document) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException;
    DoCOIndividuals<Sentence> createSentences(Paragraph paragraph) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException;
}
