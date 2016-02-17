## Research Article in Simplified HTML (RASH)

The **Research Articles in Simplified HTML** (*RASH*) format is a markup language that restricts the use of HTML elements to only 32 elements for writing academic research articles. It is possible to includes also RDFa annotations within any element of the language and other RDF statements in Turtle, JSON-LD and RDF/XML format by using the appropriate tag "script". 

The documentation (version 0.5) is available online at https://rawgit.com/essepuntato/rash/master/documentation/index.html and is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/). It documents [RASH version 0.5](https://rawgit.com/essepuntato/rash/master/grammar/rash.rng).


### How to contribute

Please use the hashtag *#rashtodo* for suggesting bugs or additional features for RASH via Twitter or other social platforms.


### List of HTML elements used

<code>a</code>, <code>blockquote</code>, <code>body</code>, <code>code</code>, <code>em</code>, <code>figcaption</code>, <code>figure</code>, <code>h1</code>, <code>head</code>, <code>html</code>, <code>img</code>, <code>li</code>, <code>link</code>, <code>math</code>, <code>meta</code>, <code>ol</code>, <code>p</code>, <code>pre</code>, <code>q</code>, <code>script</code>, <code>section</code>, <code>span</code>, <code>strong</code>, <code>sub</code>, <code>sup</code>, <code>svg</code>, <code>table</code>, <code>td</code>, <code>th</code>, <code>title</code>, <code>tr</code>, <code>ul</code>


### Change log
* Version 0.5
  * The elements ``i`` and ``b`` have been replaced by ``em`` and ``strong`` respectively (thanks Ruben Verborgh for this).
  * Removed the roles 'figurebox', 'tablebox', 'listingbox', and 'formulabox' - the correct visualisation and conversion is still guaranteed by looking at the actual elements the element ``figure`` contains.
  * The element ``img`` can have the role 'math' specified if it actually represents a mathematical formula.
  * The element ``span``, with the attribute ``role`` set to 'math', can be used to include LaTeX formulas within a RASH document.
  * Added the support for [MathJax](http://mathjax.org) so as to render correctly both LaTeX and MathML formulas in all browsers.
  * Added the support for SVG (element ``svg``) for specifying images.
  * Removed the role for internal references (i.e., 'ref', 'doc-noteref', and 'doc-biblioref'), and substituted by means of the use of an empty element ``a`` linking to the element one wants to refer to.

* Version 0.4.1
  * Corrected the mimetype for JSON-LD (now it is "application/ld+json").
  
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
