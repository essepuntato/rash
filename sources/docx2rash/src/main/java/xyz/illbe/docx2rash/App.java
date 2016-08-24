package xyz.illbe.docx2rash;

import org.apache.commons.cli.*;

/**
 *
 */
public class App {

  public static void main(String[] args) {
    CommandLineParser parser = new DefaultParser();
    Options options = new Options();
    options.addOption("i", "input", true, "The .docx file");
    options.addOption("o", "output", true, "The output directory");
    try {
      CommandLine line = parser.parse(options, args);
      if(line.hasOption("input") && line.hasOption("output")) {
        String inputPath = line.getOptionValue("input");
        String outputPath = line.getOptionValue("output");
        XSLT xslt = new XSLT(inputPath);
        xslt.transform(outputPath);
      } else {
        HelpFormatter formatter = new HelpFormatter();
        formatter.printHelp("docx2rash", options);
      }
    } catch(ParseException exp) {
      System.err.println("Unexpected exception:" + exp.getMessage());
    }
  }

}
