# RASH Framework [![Join the chat at https://gitter.im/essepuntato/rash](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/essepuntato/rash?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This project includes all the documents and source codes related to the **RASH Framework**, i.e., a set of specifications and writing/conversion/extraction tools for writing academic articles in [*RASH*](https://github.com/essepuntato/rash/tree/master/grammar), i.e., a markup language defined as a subset of HTML for writing scientific articles. RASH has been released with its own [documentation](https://rawgit.com/essepuntato/rash/master/documentation/index.html), which is a descriptive document that introduces the language and explains how to write research article by using it. In addition, there exist also [guidelines](https://rawgit.com/essepuntato/rash/master/documentation/rash-in-odt.odt) for OpenOffice that explain how to write a scholarly paper, by using the basic features available in OpenOffice Writer, in a way that it can be converted into RASH by means of an [appropriate conversion tool](https://github.com/essepuntato/rash/tree/master/tools/odt2rash).

An online conversion tool called *ROCS* (*RASH Online Conversion Service*) is available at http://dasplab.cs.unibo.it/rocs. It allows one to convert an ODT document written according to the [aforementioned guidelines](https://rawgit.com/essepuntato/rash/master/documentation/rash-in-odt.odt) into RASH, which also includes the converted LaTeX document compliant with the [Springer LNCS LaTeX class](https://www.springer.com/computer/lncs?SGWID=0-164-6-793341-0) and [ACM ICPS class](https://www.acm.org/publications/proceedings-template).

A brief introduction of all the tools included in the Framework is provided in the [related page](https://github.com/essepuntato/rash/tree/master/tools), that includes also usage information.

Please use the hashtag *#rashfwk* for referring to any of the entities defined in the RASH Framework via Twitter or other social platforms. There is also available a [Gitter room](https://gitter.im/essepuntato/rash) for discussing about the project.

A list of papers introducing the RASH Framework is enclosed at the [end of this document](#papers-introducing-the-rash-framework), as well as a [list of all the papers](#rash-papers-accepted-in-scholarly-venues) accepted in scholarly venues that have been written in RASH.

## Venues that have adopted RASH as submission format
* [15th International Semantic Web Conference (ISWC 2016)](http://iswc2016.semanticweb.org/)

* [13th Extended Semantic Web Conference (ESWC 2016)](http://2016.eswc-conferences.org/)

* [2016 International Workshop on Semantics, Analytics, Visualisation: Enhancing Scholarly Data (SAVE-SD 2016)](http://cs.unibo.it/save-sd/2016/index.html), held during the [25th International World Wide Web Conference (WWW 2016)](http://www.www2016.ca/)

* [2015 International Workshop on Semantics, Analytics, Visualisation: Enhancing Scholarly Data (SAVE-SD 2015)](http://cs.unibo.it/save-sd/2015/index.html), held during the [24th International World Wide Web Conference (WWW 2015)](http://www.www2015.it/)

* [2015 International Workshop on Learning in the Cloud (LC2015)](http://lc2015.dibris.unige.it/), held during the [26th ACM Conference on Hypertext and Social Media (Hypertex 2015)](http://ht.acm.org/ht2015/)

* [Semantic Publishing Challenge 2015 (SemPub2015)](https://github.com/ceurws/lod/wiki/SemPub2015), held during the [12th Extended Semantic Web Conference (ESWC 2015)](http://2015.eswc-conferences.org/)

* [1st International Workshop on LINKed EDucation at the ISWC 2015](https://linked2015.wordpress.com/), held during the [14th International Semantic Web Conference (ISWC 2015)](http://iswc2015.semanticweb.org/)

* [3rd International Workshop on Linked Data for Information Extraction (LD4IE 2015)](http://oak.dcs.shef.ac.uk/ld4ie2015/LD4IE2015/Overview.html), held during the [14th International Semantic Web Conference (ISWC 2015)](http://iswc2015.semanticweb.org/)

## Adopt RASH in your academic event

Please feel free to adopt RASH for accepting HTML submissions in your academic event, and don't hesitate to contact us for further information at [essepuntato@gmail.com](email:essepuntato@gmail.com). The usual template we suggest for advertising the adoption of RASH is the following one:

> Submit a zip archive containing an HTML file compliant with the *Research Articles in Simplified HTML* (*RASH*) format with the additional stylesheets and scripts included in the style package for guaranteeing a correct visualisation of the document on browsers.

> RASH is part of a framework (https://github.com/essepuntato/rash/) for facilitating the creation of HTML research articles and their publication in research venues. In particular, RASH is composed by a few of the available HTML tags and allows one to add RDFa annotations to any element.

> The current version of the RASH format is fully introduced in its documentation page (https://rawgit.com/essepuntato/rash/master/documentation/index.html), which includes several examples. The complete RelaxNG grammar of the language is available online (https://rawgit.com/essepuntato/rash/master/grammar/rash.rng). The whole style package of this format (which includes the documentation, the examples and the grammar) is also available as a ZIP archive (https://rawgit.com/essepuntato/rash/master/rash.zip).

> We encourage to use the earliest version of browsers for guaranteeing the best visualisation of the RASH documents. In addition, the translation from your RASH submission into the appropriate publishing format (either LaTeX Springer LNCS or LaTeX ACM ICPS) and the related creation of the PDF of your Camera Ready version that will be used in the official proceedings of the workshop will be totally handled by us through a semi-automatic process.

## Papers introducing the RASH Framework

* Di Iorio, A., Gonzalez-Beltran, A. G., Osborne, F., Peroni, S., Poggi, F., Vitali, F. (2016). It ROCS! The RASH Online Conversion Service. To appear in the Companion Volume of the Proceedings of the 25th International World Wide Web Conference (WWW 2016). Available in [RASH](https://rawgit.com/essepuntato/rash/master/papers/rash-poster-www2016.html) and [PDF](https://rawgit.com/essepuntato/rash/master/papers/rash-poster-www2016.pdf).

* Di Iorio, A., Nuzzolese, A. G., Osborne, F., Peroni, S., Poggi, F., Smith, M., Vitali, F. Zhao, J. (2015). The RASH Framework: enabling HTML+RDF submissions in scholarly venues. In Proceedings of the poster and demo session of the [14th International Semantic Web Conference (ISWC 2015)](http://iswc2015.semanticweb.org/). Available in [RASH](https://rawgit.com/essepuntato/rash/master/papers/rash-demo-iswc2015.html) and [PDF](http://ceur-ws.org/Vol-1486/paper_72.pdf).

* Di Iorio, A., Nuzzolese, A. G., Osborne, F., Peroni, S., Poggi, F., Smith, M., Vitali, F. Zhao, J. (2015). Poster of the ISWC 2015 demo paper "The RASH Framework: enabling HTML+RDF submissions in scholarly venues". figshare.
http://dx.doi.org/10.6084/m9.figshare.1572159

* Di Iorio, A., Nuzzolese, A. G., Osborne, F., Peroni, S., Poggi, F., Smith, M., Vitali, F., Zhao, J. (2015): RASH Framework - ISWC 2015 MoM session. figshare.
http://dx.doi.org/10.6084/m9.figshare.1566691

* Peroni, S. (2015). RASH Framework - ESWC 2015 MoM session. Presented during the Minute of Madness session at the [12th Extended Semantic Web Conference (ESWC 2015)](http://2015.eswc-conferences.org/). figshare. http://dx.doi.org/10.6084/m9.figshare.1468349

## RASH papers accepted in scholarly venues

### 14th International Semantic Web Conference ([ISWC 2015](http://iswc2015.semanticweb.org/)), poster and demo

* Angelo Di Iorio, Andrea Giovanni Nuzzolese, Francesco Osborne, Silvio Peroni, Francesco Poggi, Michael Smith, Fabio Vitali, Juhn Zhao, [*The RASH Framework: enabling HTML+RDF submissions in scholarly venues*](https://rawgit.com/essepuntato/rash/master/papers/rash-demo-iswc2015.html)

### 2015 Workshop on Semantics, Analytics, Visualisation: Enhancing Scholarly Data ([SAVE-SD 2015](http://cs.unibo.it/save-sd/2015/index.html))

* Alessia Bardi and Paolo Manghi, [*Enhanced Publication Management Systems. A systemic approach towards modern scientific communication*](http://cs.unibo.it/save-sd/2015/papers/html/bardi-savesd2015.html)

* Angelo Di Iorio, Raffaele Giannella, Francesco Poggi and Fabio Vitali, [*Exploring bibliographies for research-related tasks*](http://cs.unibo.it/save-sd/2015/papers/html/diiorio-savesd2015.html)

* Anna Lisa Gentile, Maribel Acosta, Luca Costabello, Andrea Giovanni Nuzzolese, Valentina Presutti and Diego Reforgiato, [*Conference Live: Accessible and Sociable Conference Semantic Data*](http://cs.unibo.it/save-sd/2015/papers/html/gentile-savesd2015.html)

* Anna Tordai, [*A Model for Copyright and Licensing: Elsevier’s Copyright Model*](http://cs.unibo.it/save-sd/2015/papers/html/tordai-savesd2015.html)

* Patrick Golden and Ryan Shaw, [*Period assertion as nanopublication*](http://cs.unibo.it/save-sd/2015/papers/html/golden-savesd2015.html)

* Paul Groth, [*Increasing the Productivity of Scholarship: The Case for Knowledge Graphs*](http://cs.unibo.it/save-sd/2015/papers/html/groth-savesd2015.html)

* Tobias Kuhn, [*Science Bots: A Model for the Future of Scientific Computation?*](http://cs.unibo.it/save-sd/2015/papers/html/kuhn-savesd2015.html)