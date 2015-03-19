package it.unibo.cs.savesd.rash.spar.xtractor.utils;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import org.apache.commons.lang3.StringUtils;

public class Urifier {

    public static String toURI(String label){
        //remove accents
        label = StringUtils.stripAccents(label);
        // lowercase:
        label = label.toLowerCase();
        // remove various characters:
        // '
        label = label.replaceAll("[\\']", "");
        // replace various characters with whitespace:
        // - + ( ) . , & " / ??? !
        System.out.println(label);
        label = label.replaceAll("[;.,&\\\"\\/???!]", "");
        // squeeze whitespace to dashes:
        label = label.replaceAll(" ", "-");
        
        label = label.replaceAll("\\-$", "");
        
        try {
            return URLEncoder.encode(label, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            return label;
        }
    }
    
    public static String toURI(String namespace, String label){
        label = toURI(label);
        return namespace + label;
    }
}
