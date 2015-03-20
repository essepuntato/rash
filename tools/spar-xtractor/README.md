# SPAR Xtractor

This scripts, namely sparxtract, allows to add SPAR annotations to a RASH document.
Annotations are based on the DoCO (cf. http://purl.org/spar/doco), which is an ontology that provides a description of document components, both structural and rhetorical.

## Synoptic
The script can be used from command line and its synoptic is the following:

usage: sparxtract
 -i,--input <file/uri>   MANDATORY - Input RASH document provided either
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

## Examples

$> ./sparxtract -i http://cs.unibo.it/save-sd/rash/documentation/index.html -o rash-spar.html

In case the annotation process should stop at a certain level with respect to the document structure, the level option can be used for the purpose. An example that generates DoCO annotations including bodymatter>sections (but not paragraphs and sentences) is the following:

$> ./sparxtract -i http://cs.unibo.it/save-sd/rash/documentation/index.html -o rash-spar.html -l section

A configuration file can be provided by means of the -c (or --config) parameter. The value must be a path to a file in the local file system. An example is the following:

$> ./sparxtract -i http://cs.unibo.it/save-sd/rash/documentation/index.html -c my-config.properties

# Configuration file

The configuration file is used by the application for setting-up the parameters used for customising the extraction process.
If no configuration file is provided then the default configuration is used by sparxtract.

An example of a configuration contains the following parts:

## CSS classes used for ignoring elements during the generation of SPAR annotations
it.unibo.cs.savesd.rash.spar.xtractor.html.ignore.class=code,img_block,math_block

## HTML tags that identifies structural and rhetorical parts of the document that have to be expressed by means of DoCO.
it.unibo.cs.savesd.rash.spar.xtractor.html.element.expression=html
it.unibo.cs.savesd.rash.spar.xtractor.html.element.bodymatter=body
it.unibo.cs.savesd.rash.spar.xtractor.html.element.section=div
it.unibo.cs.savesd.rash.spar.xtractor.html.element.paragraph=p

## Naming convention used for the generation of DoCO individuals.
it.unibo.cs.savesd.rash.spar.xtractor.html.namespace=
it.unibo.cs.savesd.rash.spar.xtractor.html.naming.expression=expression
it.unibo.cs.savesd.rash.spar.xtractor.html.naming.bodymatter=body
it.unibo.cs.savesd.rash.spar.xtractor.html.naming.section=section
it.unibo.cs.savesd.rash.spar.xtractor.html.naming.paragraph=paragraph
it.unibo.cs.savesd.rash.spar.xtractor.html.naming.sentence=sentence

## OpenNlp sentence detector model. The value identifies a model on the local file system. If no value is provided the default model is used.
it.unibo.cs.savesd.rash.spar.xtractor.html.opennlp.sentence.detector.model.en=
