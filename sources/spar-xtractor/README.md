# SPAR Xtractor Sources

The project is based of Apache Maven for building.

## Compiling the source code
The sources can be compiled from the top-level directory of SPAR Xtractor (i.e., the one in which this README is included in) with the following command:

$> mvn install

The clean maven instruction can be provided in order to clean software dependencies from the local maven repository before building. For example:

$> mvn clean install

The execution JUnit tests can be omitted by using the -DskipTests option. For example:

$> mvn -DskipTests install

of

$> mvn -DskipTests clean install

## Binaries

Once the compilation is successfully finished, the executable JAR file can be found under the folder main/target.
Such a JAR is named savesd.rash.spar.xtractor-VERSION.jar, where VERSION has to be replaced by the actual version of the software, e.g., savesd.rash.spar.xtractor-0.1-SNAPSHOT.jar.


## Usage
The usage of the JAR is the following

 -i,--input <file/uri>    MANDATORY - Input RASH document provided either
                          as local file path or remote URI.

 -c,--config <file>      OPTIONAL - File containing configuration
                         properties for the application. If not provided
                         the default configuration is used.

 -l,--level <string>     OPTIONAL - This parameter determines the document
                         structure level used for generating SPAR
                         annotations. By level we mean the document
                         structures such as body matter, section,
                         paragraph, sentences, etc.
                         Valid values are:
                         - bodymatter;
                         - section;
                         - paragraph;
                         - sentence.
 -o,--output <file>      OPTIONAL - File containing configuration
                         properties for the application. If not provided
                         the default configuration is used.

## Example

An example of command line execution of the binaries is the following:

$> java -jar -Xmx256m -i http://cs.unibo.it/save-sd/rash/documentation/index.html
