# DOCX2RASH Sources

The project is based of Apache Maven for building.

## Compiling the source code
The sources can be compiled from the top-level directory of DOCX2RASH converter (i.e., the one in which this README is included in) with the following command:

```sh
$ mvn install
```

## Binaries

Once the compilation is successfully finished, the executable JAR file can be found under the folder main/target.
Such a JAR is named `xyz.illbe.docx2rash-VERSION-SNAPSHOT-jar-with-dependencies.jar`, where VERSION has to be replaced by the actual version of the software, e.g., `xyz.illbe.docx2rash-0.1-SNAPSHOT-jar-with-dependencies.jar`.

## Usage

```sh
docx2rash

-i, --input <inputFile>         The .docx file or directory to be converted

-o, --output <outputDirectory>  The output directory

-h, --help
```

## Example

An example of command line execution of the binaries is the following:

```sh
$ java -jar docx2rash.jar -i ../../testbed/docx/testbed-13.docx -o testout/
```
