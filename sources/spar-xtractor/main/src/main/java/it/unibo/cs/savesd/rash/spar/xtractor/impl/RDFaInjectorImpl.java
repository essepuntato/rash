package it.unibo.cs.savesd.rash.spar.xtractor.impl;

import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCO;
import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCOClass;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.parser.Tag;
import org.jsoup.select.Elements;

import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.Resource;

public class RDFaInjectorImpl {

    public void createDoCOElement(Element element, URI uri) {
        element.attr("about", uri.toString());
    }
    
    public void createDoCOElement(Element element, Resource resource, DoCOClass docoClass) {
        element.attr("resource", resource.toString());
        element.attr("typeOf", DoCO.getDoCOClass(docoClass).getURI());
    }
    
    public void createDoCOElement(Element element, Property property, Resource resource, DoCOClass docoClass) {
        element.attr("resource", resource.toString());
        element.attr("typeOf", DoCO.getDoCOClass(docoClass).getURI());
        element.attr("property", property.toString());
    }
    
    public Element appendDoCOElement(Element parent, Tag childTag, Property property) {
        Element child = new Element(childTag, "");
        parent.appendChild(child);
        child.attr("property", property.toString());
        
        return child;
    }
    
    public Element appendDoCOElement(Element parent, Tag childTag, Property property, Resource resource, DoCOClass docoClass) {
        Element child = new Element(childTag, "");
        parent.appendChild(child);
        child.attr("property", property.toString());
        
        if(resource != null) child.attr("resource", resource.toString());
        if(docoClass != null) child.attr("typeOf", DoCO.getDoCOClass(docoClass).getURI());
        
        return child;
    }
    
    public void appendDoCOElement(Element parent, Element originalChild, Tag childTag, Property property, Resource resource, DoCOClass docoClass) {
        Element child = new Element(childTag, "");
        parent.appendChild(child);
        System.out.println("--- " + originalChild.html());
        originalChild.remove();
        child.attr("property", property.toString());
        child.attr("resource", resource.toString());
        child.attr("typeOf", DoCO.getDoCOClass(docoClass).getURI());
        
        child.appendChild(originalChild);
        
    }
    
    public Elements removeChildren(Element parent){
        return parent.children().remove();
    }

    
    public static void main(String[] args) {
        try {
            Document document = Jsoup.parse(new URL("http://cs.unibo.it/save-sd/rash/documentation/index.html"), 10000);
            RDFaInjectorImpl rdfaInjectorImpl = new RDFaInjectorImpl();
            Elements elements = rdfaInjectorImpl.removeChildren(document.body());
            for(Element element : elements){
                System.out.println(element.text());
            }
                    
        } catch (MalformedURLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
}
