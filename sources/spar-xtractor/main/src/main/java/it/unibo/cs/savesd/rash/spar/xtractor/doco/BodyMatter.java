package it.unibo.cs.savesd.rash.spar.xtractor.doco;

import org.jsoup.nodes.Element;

import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCO;

import com.hp.hpl.jena.rdf.model.Resource;

public class BodyMatter extends AbstDoCOIndividual {

    public BodyMatter(Element element) throws InvalidDoCOIndividualException {
        super(element);
    }

    @Override
    public Resource getDoCOClass() {
        return DoCO.BodyMatter;
    }

}
