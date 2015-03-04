# RASH Framework

This project includes all the documents and source codes related to the **RASH Framework**, i.e., a set of specifications and writing/conversion/extraction tools for writing academic articles in *RASH*, i.e., a markup language defined as a subset of HTML for writing scientific articles.

Please use the hashtag *#rashfwk* for referring to any of the items defined in the RASH Framework via Twitter or other social platforms.

## Research Article in Simplified HTML (RASH)

The **Research Articles in Simplified HTML** (*RASH*) format is a markup language that restricts the use of HTML elements to only 25 elements for writing academic research articles. It is possible to includes also RDFa annotations within any element of the language and other RDF statements in Turtle format by using the appropriate tag "script". 

The documentation (version 0.2.1) is available online at http://cs.unibo.it/save-sd/rash and is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/). It documents [RASH version 0.3.1](http://cs.unibo.it/save-sd/rash/grammar/rash.rng) (which is also available also as a [pure HTML grammar](http://cs.unibo.it/save-sd/rash/grammar/rash-html.rng)).


### How to contribute

Please use the hashtag *#rashtodo* for suggesting bugs or additional features for RASH via Twitter or other social platforms.


### Change log
* Version 0.3.1
  * The declaration of the attribute type (that was not used by any element) has been removed from the language.

* Version 0.3
  * The attribute "type" of the element "ul" has been removed.
  * Now unordered lists are specifiable through the element "ul", while the ordered ones are specifiable using "ol".
  * All the elements "img" must have the attribute "alt" specified.
  * Within the element "head", it is possible to use the tag "script" with attribute "type" set to "text/turtle" in order to add RDF statements in Turtle format.
  
* Version 0.1
  * First release of the language.