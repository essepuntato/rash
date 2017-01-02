## RASH Javascript support files

This directory contains all the Javascript files used for visualising RASH documents in a browser. In particular, while ``bootstrap.min.js`` and ``jquery.min.js`` are two support files used for running Bootstrap and JQuery respectively, ``rash.js`` implements the whole layout mechanism of RASH documents.

The ``rash.js`` script does modify the structure of the RASH document by adding additional elements characterised by the class "cgen" (i.e. client generated), while other elements are also added by means of the MathJAX script, if used. All the elements with class "cgen" are also accompanied by another attribute, "data-rash-original-content", that defines what was the content that has been substituted by means of the "cgen" element in consideration.

In principle, one can obtain the original RASH document from the one visualised on the browser by removing all the sub-trees having a "cgen" element as root, by replacing them with the value specified in the related "data-rash-original-content" attributes, and by removing all the additional elements introduced by MathJAX.