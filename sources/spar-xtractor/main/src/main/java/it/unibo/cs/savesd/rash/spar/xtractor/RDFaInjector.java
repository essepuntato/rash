package it.unibo.cs.savesd.rash.spar.xtractor;

import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCOClass;

import org.jsoup.nodes.Element;

public interface RDFaInjector {
    
    void inject(Element element, DoCOClass docoClass);

}
