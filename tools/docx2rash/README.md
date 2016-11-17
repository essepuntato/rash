# DOCX2RASH Executable

> Convert a .docx document to RASH format
The conversion is based on a [particular XSLT document](https://github.com/essepuntato/rash/blob/master/xslt/from-docx.xsl) and allows one to convert Microsoft Word documents, written according to [specific guidelines](https://rawgit.com/essepuntato/rash/master/documentation/rash-in-docx.focx) using only basic features of Microsoft Word, into RASH documents automatically.

## Usage

```sh
docx2rash

-i, --input <inputFile>         The input .docx file to be converted

-o, --output <outputDirectory>  The output directory

-h, --help
```

## Example

An example of command line execution of the binaries is the following:

```sh
$ java -jar docx2rash.jar -i ../../testbed/docx/testbed-13.docx -o testout/
```
