package it.unibo.cs.rash.odt2rash;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamSource;


//import javax.xml.transform.Transformer;
//import javax.xml.transform.TransformerFactory;
//import javax.xml.transform.stream.StreamSource;
import net.sf.saxon.TransformerFactoryImpl;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;

public class ODT2RASH {

	static String XSLT_FILE = "xslt/from-odt.xsl";
	static String XML_FILE = "content.xml";
	
	//static String input_fld = "test/";
	static String INPUT_FILE; // = "doceng15_short_v6.odt";
	static String OUTPUT_FLD; // = "test/out/";
	static String OUTPUT_FILE;
	
	static String tempFolderName;
	
	private static final Logger log = Logger.getLogger(ODT2RASH.class.getName());
	
	public static void main(String[] args) throws IOException, IllegalArgumentException {
		
		// DISABLE LOGGING TO STDOUT
		//log.setUseParentHandlers(false);
		
		Options options = new Options();
		options.addOption("i", true, "specify the input file");
		options.addOption("o", true, "specify the output folder");
		options.addOption("h", false, "print this message");
		CommandLineParser parser = new DefaultParser();
		try {
			CommandLine cmd = parser.parse(options, args);
			if (cmd.hasOption("h")) {
				System.out.println("-i  <file>		MANDATORY - THe input .odt document.");
				System.out.println("-o  <folder>	MANDATORY - The folder where the output RASH file should be stored.");
				System.out.println("-h  			Print this message.");
			    return ;
			}
			
			if (cmd.hasOption("i")) {
				//log.log(Level.INFO, "Using cli argument -i=" + cmd.getOptionValue("i"));
			    INPUT_FILE = cmd.getOptionValue("i");
				File f = new File(INPUT_FILE);
				if (!f.isFile() || !f.canRead() || f.isDirectory()) {
					//log.log(Level.SEVERE, "Unable to load input file/folder");
					throw new IllegalArgumentException("ERROR: Unable to load input file/folder");
				}
				
			} else {
				//log.log(Level.SEVERE, "Missing -i option");
			    throw new IllegalArgumentException("Error: Missing -i option");
			}
			
			if (cmd.hasOption("o")) {
				//log.log(Level.INFO, "Using cli argument -o=" + cmd.getOptionValue("o"));
				OUTPUT_FLD = cmd.getOptionValue("o");
				File f = new File(OUTPUT_FLD);
				if (!f.canRead() || !f.isDirectory()) {
					//f.mkdirs();
					log.log(Level.INFO, "Folder(s) " + f.getAbsolutePath() + " created");
				}
			} else {
				//log.log(Level.SEVERE, "Missing -o option");
			    throw new IllegalArgumentException("Error: Missing -o option");
			}
			
		} catch (ParseException e) {
			log.log(Level.SEVERE, "Failed to parse comand line properties", e);
			//help();
			return ;
		}

		OUTPUT_FILE = FilenameUtils.getBaseName(INPUT_FILE) +".html";
		tempFolderName = FilenameUtils.getBaseName(INPUT_FILE) + "-sources";
		
		unZipIt(INPUT_FILE, OUTPUT_FLD + File.separator + tempFolderName);
		
		File picturesDir = new File(OUTPUT_FLD + File.separator + tempFolderName + File.separator + "Pictures");
		if (picturesDir.exists()) {
			FileUtils.copyDirectory(picturesDir, new File(OUTPUT_FLD + File.separator + "img"));
		}
/*
		URL ujs = ODT2RASH.class.getClassLoader().getResource("js/");
        File js = new File(ujs.getPath());
        FileUtils.copyDirectory(js, new File(OUTPUT_FLD + File.separator + "js"));
		URL ucss = ODT2RASH.class.getClassLoader().getResource("css/");
        File css = new File(ucss.getPath());
        FileUtils.copyDirectory(css, new File(OUTPUT_FLD + File.separator + "css"));
*/
		
		ArrayList<String> css2include = new ArrayList<String>();
		css2include.add("rash.css");
		css2include.add("lncs.css");
		css2include.add("bootstrap.min.css");
		for (String file : css2include) {
			InputStream is = ODT2RASH.class.getClassLoader().getResourceAsStream("css/" + file);
			FileUtils.copyInputStreamToFile(is, new File(OUTPUT_FLD + File.separator + "css" + File.separator + file));	
		}
		
		ArrayList<String> js2include = new ArrayList<String>();
		js2include.add("rash.js");
		js2include.add("jquery.min.js");
		js2include.add("bootstrap.min.js");
		for (String file : js2include) {
			InputStream is = ODT2RASH.class.getClassLoader().getResourceAsStream("js/" + file);
			FileUtils.copyInputStreamToFile(is, new File(OUTPUT_FLD + File.separator + "js" + File.separator + file));	
		}  
		try {

            TransformerFactory tFactory = TransformerFactoryImpl.newInstance("net.sf.saxon.TransformerFactoryImpl", null);

            StreamSource xslStream = new javax.xml.transform.stream.StreamSource(ODT2RASH.class.getClassLoader().getResourceAsStream(XSLT_FILE));
            Transformer transformer =
                    tFactory.newTransformer(xslStream);

            transformer.setParameter("dir", OUTPUT_FLD + File.separator + tempFolderName + File.separator);
            transformer.setParameter("basecss", "css/");
            transformer.setParameter("basejs", "js/");
            //transformer.setParameter("baserng", );
            transformer.setParameter("baseimg", "img/");
            
            transformer.transform(
                    new javax.xml.transform.stream.StreamSource(OUTPUT_FLD + File.separator + tempFolderName + File.separator + XML_FILE),
                    new javax.xml.transform.stream.StreamResult( new FileOutputStream(OUTPUT_FLD + File.separator + OUTPUT_FILE))
            );
		} catch (Exception e) {
            e.printStackTrace( );
		}
		
		File tempDir = new File(OUTPUT_FLD + File.separator + tempFolderName);
		if (tempDir.exists())
			FileUtils.deleteDirectory(tempDir);
		
		System.out.println("File " + INPUT_FILE + " successefully converted into RASH.");

	}

	
    
    /**
     * Extracts content.xml and pictures from an odt file specified by the zipFilePath to a directory specified by
     * destDirectory (will be created if does not exists)
     * @param zipFilePath
     * @param destDirectory
     * @throws IOException
     */
    static void unZipIt(String zipFile, String outputFolder) {

        byte[] buffer = new byte[1024];
       	
        try{
       		
	       	//create output directory is not exists
	       	File folder = new File(outputFolder);
	       	if(!folder.exists()) {
	       		folder.mkdir();
	       	}
	       		
	       	//get the zip file content
	       	ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile));
	       	//get the zipped file list entry
	       	ZipEntry ze = zis.getNextEntry();
	       		
	       	while(ze!=null){
	       			
	       	   String fileName = ze.getName();
	           File newFile = new File(outputFolder + File.separator + fileName);
	                   
	           //System.out.println("file unzip : "+ newFile.getAbsoluteFile());
	                   
	           //create all non exists folders
	           //else you will hit FileNotFoundException for compressed folder
	           new File(newFile.getParent()).mkdirs();
	                 
	           FileOutputStream fos = new FileOutputStream(newFile);             
	
	           int len;
	           while ((len = zis.read(buffer)) > 0) {
	        	   fos.write(buffer, 0, len);
	           }
	           		
	           fos.close();   
	           ze = zis.getNextEntry();
	       	}
	       	
	        zis.closeEntry();
	       	zis.close();
	       		
	       	//System.out.println("Done");
       		
        }catch(IOException ex) {
        	ex.printStackTrace();
        }
    }
    
}
