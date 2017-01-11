package xyz.illbe.docx2rash;

import net.lingala.zip4j.exception.ZipException;
import org.apache.commons.cli.*;

import javax.xml.transform.TransformerException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.HashMap;

/**
 *
 */
public class App {

    private static final String INPUT_ARG = "input";
    private static final String OUTPUT_ARG = "output";

    private static HashMap<String, String> checkArgs(String[] args) throws IllegalArgumentException, ParseException {
        HashMap<String, String> map = new HashMap<String, String>();
        CommandLineParser parser = new DefaultParser();
        Options options = new Options();
        options.addOption(
                Option.builder("i").longOpt("input")
                        .hasArg().argName("inputFile")
                        .desc("The .docx file or directory to be converted").build()
        );
        options.addOption(
                Option.builder("o").longOpt("output")
                        .hasArg().argName("outputDirectory")
                        .desc("The output directory").build()
        );
        options.addOption("h", "help", false, "Prints this help message");
        CommandLine line = parser.parse(options, args);
        if (line.hasOption("help")) {
            HelpFormatter formatter = new HelpFormatter();
            formatter.printHelp("docx2rash", options);
        } else {
            if (!line.hasOption("input")) {
                throw new IllegalArgumentException("Error: Missing -i option");
            }
            if (!line.hasOption("output")) {
                throw new IllegalArgumentException("Error: Missing -o option");
            }
            String inputPath = line.getOptionValue("input");
            String outputPath = line.getOptionValue("output");
            map.put(INPUT_ARG, inputPath);
            map.put(OUTPUT_ARG, outputPath);
        }
        return map;
    }

    public static void main(String[] args) {
        try {
            HashMap<String, String> map = checkArgs(args);
            if (!map.isEmpty()) {
                XSLT xslt = new XSLT(map.get(INPUT_ARG));
                xslt.transform(map.get(OUTPUT_ARG));
                System.out.println("File successfully converted in " + map.get(OUTPUT_ARG) + " directory.");
            }
        } catch (IllegalArgumentException e) {
            System.err.println(e.getMessage());
        } catch (ParseException e) {
            System.err.println("Unexpected error while parsing arguments: " + e.getMessage());
        } catch (TransformerException e) {
            System.err.println(e.getMessage());
        } catch (ZipException e) {
            System.err.println(e.getMessage());
        } catch (IOException e) {
            System.err.println(e.getMessage());
        } finally {
            XSLT.clean();
        }
    }

}
