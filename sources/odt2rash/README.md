# SPAR Xtractor Sources

The project is based of Apache Maven for building.

## Compiling the source code
The sources can be compiled from the top-level directory of SPAR Xtractor (i.e., the one in which this README is included in) with the following command:

$> mvn install

The clean maven instruction can be provided in order to clean software dependencies from the local maven repository before building. For example:

$> mvn clean install

## Binaries

Once the compilation is successfully finished, the executable JAR file can be found under the folder main/target.
Such a JAR is named rash.odt2rash-VERSION-jar-with-dependencies.jar, where VERSION has to be replaced by the actual version of the software, e.g., rash.odt2rash-0.1-SNAPSHOT-jar-with-dependencies.jar.


## Usage
The usage of the JAR is the following

 -i  <file>		MANDATORY - THe input .odt document.

 -o  <folder>	MANDATORY - The folder where the output RASH file should be stored.

 -h  			Print this message.

## Example

An example of command line execution of the binaries is the following:

$> java -jar target/rash.odt2rash-0.1-SNAPSHOT-jar-with-dependencies.jar -i ../testbed/odt/testbed-1.odt -o testout/