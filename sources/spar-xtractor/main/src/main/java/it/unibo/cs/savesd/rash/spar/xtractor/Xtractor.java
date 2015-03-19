package it.unibo.cs.savesd.rash.spar.xtractor;

import java.net.MalformedURLException;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

public interface Xtractor {
    void extract(String path) throws MalformedURLException;
    void createBodyMatter(Document document);
    void createSections(Document document);
    void createSections(Element body, Document document);
    void createParagraphs(Document document);
    void createParagraphs(Element section, Document document);
    void createSentences(Document document);
    void createSentences(Element element, Document document);
}
