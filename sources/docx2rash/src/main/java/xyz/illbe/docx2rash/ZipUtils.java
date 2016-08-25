package xyz.illbe.docx2rash;

import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.exception.ZipException;

import java.io.File;

/**
 * Zip utilities
 */
public class ZipUtils {

    public static void unzip(File file, String outputDir) throws ZipException {
        ZipFile zip = new ZipFile(file);
        zip.extractAll(outputDir);
    }

}
