package it.unibo.cs.savesd.rash.spar.xtractor.application;

import it.unibo.cs.savesd.rash.spar.xtractor.Xtractor;
import it.unibo.cs.savesd.rash.spar.xtractor.config.ConfigBuilder;
import it.unibo.cs.savesd.rash.spar.xtractor.impl.XtractorImpl;
import it.unibo.cs.savesd.rash.spar.xtractor.vocabularies.DoCOClass;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.OptionBuilder;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.cli.PosixParser;
import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.ConfigurationException;
import org.jsoup.nodes.Document;

public class Main {

    private static final String INPUT_RASH = "i";
    private static final String INPUT_RASH_LONG = "input";
    private static final String OUTPUT_RASH_SPAR = "o";
    private static final String OUTPUT_RASH_SPAR_LONG = "output";
    private static final String INPUT_CONFIG = "c";
    private static final String INPUT_CONFIG_LONG = "config";
    private static final String LEVEL = "l";
    private static final String LEVEL_LONG = "level";
    
    @SuppressWarnings("static-access")
    public static void main(String[] args) {
        
        /*
         * Set-up the options for the command line parser.
         */
        Options options = new Options();
        
        
        Option inputRashOption = OptionBuilder.withArgName("file/uri")
                                 .hasArg()
                                 .isRequired(true)
                                 .withDescription("MANDATORY - Input RASH document provided either as local file path or remote URI.")
                                 .withLongOpt(INPUT_RASH_LONG)
                                 .create(INPUT_RASH);
        
        Option outputRashSparOption = OptionBuilder.withArgName("file")
                                      .hasArg()
                                      .isRequired(false)
                                      .withDescription("OPTIONAL - File containing configuration properties for the application. If not provided the default configuration is used.")
                                      .withLongOpt(OUTPUT_RASH_SPAR_LONG)
                                      .create(OUTPUT_RASH_SPAR);
        
        Option inputConfigOption = OptionBuilder.withArgName("file")
                                   .hasArg()
                                   .isRequired(false)
                                   .withDescription("OPTIONAL - File containing configuration properties for the application. If not provided the default configuration is used.")
                                   .withLongOpt(INPUT_CONFIG_LONG)
                                   .create(INPUT_CONFIG);
        
        Option levelOption = OptionBuilder.withArgName("string")
                            .hasArg()
                            .isRequired(false)
                            .withDescription(
                                    "OPTIONAL - This parameter determines the document structure level used for generating SPAR annotations. By level we mean the document structures such as body matter, section, paragraph, sentences, etc.\n " +
                                    "Valid values are: \n\t - bodymatter;\n\t - section;\n\t - paragraph;\n\t - sentence."
                                    )
                            .withLongOpt(LEVEL_LONG)
                            .create(LEVEL);
                                 
        options.addOption(inputRashOption);
        options.addOption(outputRashSparOption);
        options.addOption(inputConfigOption);
        options.addOption(levelOption);
        
        CommandLine commandLine = null;
        
        CommandLineParser cmdLinePosixParser = new PosixParser();
        try {
            commandLine = cmdLinePosixParser.parse(options, args);
        } catch (ParseException e) {
            HelpFormatter formatter = new HelpFormatter();
            formatter.printHelp( "sparXtract", options );
        }
        
        if(commandLine != null){
            for(Option option : commandLine.getOptions()){
                System.out.println(option.getValue());
            }
            String inputRash = commandLine.getOptionValue(INPUT_RASH);
            String outputRashSpar = commandLine.getOptionValue(OUTPUT_RASH_SPAR);
            String configFile = commandLine.getOptionValue(INPUT_CONFIG);
            String level = commandLine.getOptionValue(LEVEL);
            
            if(inputRash != null){
                
                Configuration configuration = null;
                try {
                    if(configFile != null) 
                        configuration = ConfigBuilder.init(new File(configFile));
                    else configuration = ConfigBuilder.init();
                } catch (MalformedURLException e) {
                    e.printStackTrace();
                } catch (ConfigurationException e) {
                    e.printStackTrace();
                }
                
                if(configuration != null){
                    
                    /*
                     * Configure the extractor.
                     */
                    Xtractor xtractor = new XtractorImpl(configuration);
                    DoCOClass docoClass;
                    if(level != null){
                        if(level.equalsIgnoreCase("expression"))
                            docoClass = DoCOClass.Expression;
                        else if(level.equalsIgnoreCase("bodymatter"))
                            docoClass = DoCOClass.BodyMatter;
                        else if(level.equalsIgnoreCase("section"))
                            docoClass = DoCOClass.Section;
                        else if(level.equalsIgnoreCase("paragraph"))
                            docoClass = DoCOClass.Paragraph;
                        else docoClass = DoCOClass.Sentence;
                    }
                    else docoClass = DoCOClass.Sentence;
                    
                    try {
                        Document document = xtractor.extract(inputRash, docoClass);
                        OutputStream outputStream = null;
                        if(outputRashSpar != null){
                            File file = new File(outputRashSpar);
                            File parent = file.getParentFile();
                            if(parent != null){
                                if(!parent.exists()) parent.mkdirs();
                            }
                            try {
                                outputStream = new FileOutputStream(file);
                            } catch (FileNotFoundException e) {
                                e.printStackTrace();
                                outputStream = System.out;
                            }
                        }
                        else outputStream = System.out;
                        
                        /*
                         * Write the document to the output stream.
                         */
                        byte[] html = document.html().getBytes();
                        if(html.length < 2048) {
                            outputStream.write(html, 0, html.length);
                            outputStream.flush();
                        }
                        else {
                            int read = 0;
                            int iteration = 0;
                            while(read < html.length){
                                int offset = iteration*2048;
                                int missing = html.length - read;
                                int len = missing < 2048 ? missing : 2048;
                                outputStream.write(html, offset, len);
                                
                                outputStream.flush();
                                read += 2048;
                                iteration += 1;
                                
                            }
                        }
                        
                        outputStream.flush();
                        outputStream.close();
                        
                    } catch (MalformedURLException e) {
                        e.printStackTrace();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                
            }
        }
        
    }
    
}
