package it.unibo.cs.savesd.rash.spar.xtractor.doco;

import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCO;

import org.jsoup.nodes.Element;

import com.hp.hpl.jena.rdf.model.Resource;

public class Expression extends AbstDoCOIndividual {

    protected Expression(Element element) throws InvalidDoCOIndividualException {
        super(element);
    }

    public Resource getDoCOClass() {
        return DoCO.Expression;
    }
}
