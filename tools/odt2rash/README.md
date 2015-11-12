# ODT2RASH Executable

The odt2rash.jar executable converts an odt file into the RASH format.

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
