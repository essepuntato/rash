package xyz.illbe.docx2rash;

import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.exception.ZipException;

import java.net.URL;



/**
 * Zip utilities
 */
public class ZipUtils {

    public static void unzip(URL file, String outputDir) {
        try {
            ZipFile zip = new ZipFile(file.getFile());
            zip.extractAll(outputDir);
        } catch(ZipException e) {
            e.printStackTrace();
        }
    }

}
