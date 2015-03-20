package it.unibo.cs.savesd.rash.spar.xtractor.doco;

import org.jsoup.nodes.Element;

import com.hp.hpl.jena.rdf.model.Resource;

/**
 * A {@link DoCOIndividual} is any individual type with a DoCO class.
 * 
 * 
 * @author Andrea Nuzzolese
 *
 */
public interface DoCOIndividual {
    
    /**
     * Return the URI that identifies the individual.
     * 
     * @return {@link String}
     */
    String getURI();
    
    /**
     * Return the {@link Element} representation of a {@link DoCOIndividual}.
     * 
     * @return {@link Element}
     */
    Element asElement();
    
    /**
     * Return the DoCO class used for typing the individual.
     * 
     * @return {@link Resource}
     */
    Resource getDoCOClass();
    
    /**
     * Convert the {@link DoCOIndividuals} to a Jena {@link Resource}.
     * 
     * @return {@link Resource}
     */
    Resource asResource();
    
}
