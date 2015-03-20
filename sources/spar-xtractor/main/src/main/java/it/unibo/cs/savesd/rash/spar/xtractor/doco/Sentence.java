package it.unibo.cs.savesd.rash.spar.xtractor.doco;

import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCO;

import org.jsoup.nodes.Element;

import com.hp.hpl.jena.rdf.model.Resource;

public class Sentence extends AbstDoCOIndividual {

    protected Sentence(Element element) throws InvalidDoCOIndividualException {
        super(element);
    }

    @Override
    public Resource getDoCOClass() {
        return DoCO.Sentence;
    }

}
