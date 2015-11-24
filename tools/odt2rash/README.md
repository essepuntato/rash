# ODT2RASH Executable

The odt2rash.jar executable converts an ODT file into the RASH format. The conversion is based on a [particular XSLT document](https://github.com/essepuntato/rash/blob/master/xslt/from-odt.xsl) and allows one to convert OpenOffice documents, written according to [specific guidelines](https://rawgit.com/essepuntato/rash/master/documentation/rash-in-odt.odt) using only basic features of OpenOffice, into RASH documents automatically.

## Usage
The usage of the JAR is the following

 -i  <file>		MANDATORY - The input .odt document.

 -o  <folder>	MANDATORY - The folder where the RASH output file should be stored.

 -h  			Print this message.

## Example

An example of command line execution of the binaries is the following:

$> java -jar odt2rash.jar -i ../../testbed/odt/testbed-13.odt -o testout/


# RUNTEST.SH

This script uses the odt2rash.jar archive contained in the bin/ subfolder to convert the odt testbed documents (contained in the /testbed/odt/ folder) into the RASH format. The results of the conversion are stored in the out/ folder.
