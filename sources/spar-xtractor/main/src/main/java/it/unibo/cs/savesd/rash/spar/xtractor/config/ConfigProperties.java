package it.unibo.cs.savesd.rash.spar.xtractor.config;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author Andrea Nuzzolese
 *
 */

public class ConfigProperties {
    
    private static final Logger LOG = LoggerFactory.getLogger(ConfigProperties.class); 
    
    private static final String ARTIFACT_ID = "it.unibo.cs.savesd.rash.spar.xtractor.html";
    public static final String HTML_ELEMENT_SECTION = ARTIFACT_ID + ".element.section";
    public static final String HTML_ELEMENT_PARAGRAPH = ARTIFACT_ID + ".element.paragraph";
    public static final String HTML_IGNORE_CLASS = ARTIFACT_ID + ".ignore.class";
    public static final String SENTENCE_DETECTOR_MODEL_EN = ARTIFACT_ID + "opennlp.sentence.detector.model.en";
    public static final String NAMESPACE = ARTIFACT_ID + ".namespace";
    public static final String NAMING_BODY_MATTER = ARTIFACT_ID + ".naming.bodymatter";
    public static final String NAMING_SECTION = ARTIFACT_ID + ".naming.section";
    public static final String NAMING_PARAGRAPH = ARTIFACT_ID + ".naming.paragraph";
    public static final String NAMING_SENTENCE = ARTIFACT_ID + ".naming.sentence";
    
    public static Set<String> keys(){
        Set<String> keys = new HashSet<String>();
        Field[] fields = ConfigProperties.class.getFields();
        for(Field field : fields){
            String value = null;
            try {
                value = (String) field.get(value);
                System.out.println(value);
            } catch (IllegalArgumentException e) {
                LOG.error(e.getMessage(), e);
            } catch (IllegalAccessException e) {
                LOG.error(e.getMessage(), e);
            }
            if(value != null) keys.add(value);
        }
        
        return keys;
    }
    
}
