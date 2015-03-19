package it.unibo.cs.savesd.rash.spar.xtractor.config;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import org.apache.commons.configuration.CompositeConfiguration;
import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;

/**
 * This class allows the initialization of SPAR Xtractor.
 * Initialization properties a .properties file.
 * 
 * @author Andrea Nuzzolese
 *
 */
public class ConfigBuilder {
    
    /**
     * Properties are loaded form the default property file located at src/main/resources/META-INF/config/xtractor.properties
     * 
     * @return {@link Configuration}
     * @throws ConfigurationException 
     */
    public static Configuration init() throws ConfigurationException{
        URL url = ConfigBuilder.class.getClassLoader().getResource("META-INF/config/xtractor.properties");
        return init(url);
    }
    
    /**
     * Properties are loaded form the a property file provided in input.
     * 
     * @param A {@link File} containing configuration properties.
     * @return {@link Configuration}
     * @throws MalformedURLException 
     * @throws ConfigurationException 
     */
    public static Configuration init(File file) throws MalformedURLException, ConfigurationException{
        return init(file.toURI().toURL());
    }
    
    private static Configuration init(URL url) throws ConfigurationException{
        Configuration config = new CompositeConfiguration();
        ((CompositeConfiguration)config).addConfiguration(new PropertiesConfiguration(url));
        return config;
    }
}
