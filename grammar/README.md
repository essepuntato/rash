## Research Article in Simplified HTML (RASH)

The **Research Articles in Simplified HTML** (*RASH*) format is a markup language that restricts the use of HTML elements to only 25 elements for writing academic research articles. It is possible to includes also RDFa annotations within any element of the language and other RDF statements in Turtle format by using the appropriate tag "script". 

The documentation (version 0.2.4) is available online at http://cs.unibo.it/save-sd/rash and is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/). It documents [RASH version 0.3.5](http://cs.unibo.it/save-sd/rash/grammar/rash.rng).


### How to contribute

Please use the hashtag *#rashtodo* for suggesting bugs or additional features for RASH via Twitter or other social platforms.


### Change log
* Version 0.4
  * Now it is possible to creating refereanceable listing boxes by means of the element 'figure' with attribute '@role' set to 'listingbox'.
  * The structural semantics that was provided by means of specific element classes (specified with the attribute '@class') is now defined by means of the attribute '@role'. 
  * All the roles used in RASH elements are strictly aligned, when possible, with the [Digital Publishing WAI-ARIA Module 1.0, W3C Editor's Draft 21 October 2015](https://rawgit.com/w3c/aria/master/aria/dpub.html).
  * Element 'div' (used for defining sections and floating boxes) has been substituted with more appropriate semantic tags, i.e., 'section' and 'figure'.
  * All the inline and block codes are now handled with the element 'code' and 'pre' (plus 'code) respectively instead of using 'span' and 'p' with the class 'code' specified.
  * The element 'blockquote' is introduced for expressing quoting blocks within the text and must be used instead of the element 'p' with class 'quote'.
  * It is possible to specify listing boxes by means of the element 'figure' having role 'listing', so as to reference explicitly to them within the text as for figures, tables and formulas.
  * The caption of floating box is now specificable by means of the element 'figcaption' instead of using the element 'p' with class 'caption'.
  * RDF/XML and CSV formats are now specifiable within the element 'script' in 'head'.
  * The update of documents written with old RASH versions is now automatically handled by the script [rash-update.sh](https://github.com/essepuntato/rash/blob/master/tools/rash-update.sh) based on the XSLT [rash-update.xslt](https://github.com/essepuntato/rash/blob/master/xslt/rash-update.xsl).

* Version 0.3.5
  * Added the possibility of specifying RDF statement in JSON-LD within the tag "script" having type "application/ld+json".
  * The grammar is also available in RelaxNG Compact syntax.

* Version 0.3.4
  * The elements div[@class='abstract'] and div[@class='bibliography'] have been specified as optional.
  * Bug fix: the element "meta" used for specifying author's email has been aligned to what introduced in the documentation.

* Version 0.3.2
  * The two grammars (XHTML and HTML) have been merged in one only grammar (i.e., rash.rng), according to the discussion in issue #21

* Version 0.3.1
  * The declaration of the attribute type (that was not used by any element) has been removed from the language.

* Version 0.3
  * The attribute "type" of the element "ul" has been removed.
  * Now unordered lists are specifiable through the element "ul", while the ordered ones are specifiable using "ol".
  * All the elements "img" must have the attribute "alt" specified.
  * Within the element "head", it is possible to use the tag "script" with attribute "type" set to "text/turtle" in order to add RDF statements in Turtle format.
  
* Version 0.1
  * First release of the language.