package it.unibo.cs.savesd.rash.spar.xtractor.doco;

import java.lang.reflect.Constructor;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

import org.jsoup.nodes.Element;

public class DoCOIndividualBuilder {

    public static <T extends DoCOIndividual> T build(Class<T> docoClass, Element element, Map<String,String> prefixes) throws InvalidDoCOIndividualException, MissmatchingDoCOClassDeclarationException, NotInstantiableIndividualException {
        T individual = null;
        
        String type = element.attr("typeOf");
        if(type != null){
            
            String namespace = null;
            String typeId = null;
            
            boolean exit = false;
            try {
                /*
                 * Check if the type is provided as an URL, otherwise use a namespace prefix.
                 */
                new URL(type);
                
                int index = type.lastIndexOf("/")+1;
                namespace = type.substring(0, index+1);
                typeId = type.substring(index+1);
                
            } catch (MalformedURLException e) {
                int prefixEnd = type.indexOf(":");
                if(prefixEnd>=0){
                    String prefix = type.substring(0, prefixEnd+1);
                    typeId = type.substring(prefixEnd+1);
                    namespace = prefixes.get(prefix);
                    
                    type = namespace + type;
                }
                else exit = true;
                    
            }
            
            if(!exit){
                
                Constructor<T> constructor;
                try {
                    constructor = docoClass.getDeclaredConstructor(Element.class);
                    constructor.setAccessible(true);
                    
                    individual = constructor.newInstance(element);
                    
                    if(type.equals(individual.getDoCOClass().getURI()))
                        return individual;
                    else throw new MissmatchingDoCOClassDeclarationException();
                    
                
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new NotInstantiableIndividualException();
                }
            }
            else throw new InvalidDoCOIndividualException();
        }
        
        throw new InvalidDoCOIndividualException();
    }
    
}
