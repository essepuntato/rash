package it.unibo.cs.savesd.rash.spar.xtractor.doco;

import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCO;

import org.jsoup.nodes.Element;

import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Resource;

public abstract class AbstDoCOIndividual implements DoCOIndividual {

    protected Element element;
    protected String uri;
    
    protected AbstDoCOIndividual(Element element) throws InvalidDoCOIndividualException {
        this.element = element;
        this.uri = element.attr("resource");
    }
    
    @Override
    public Element asElement(){
        return element;
    }
    
    @Override
    public String getURI() {
        return uri;
    }
    
    @Override
    public Resource asResource() {
        return ModelFactory.createDefaultModel().createResource(this.uri);
    }

    
}
