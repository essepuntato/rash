# The RASH Online Conversion Service (ROCS)

The *RASH Online Conversion Service*, or *ROCS*, is a Python web application based on [web.py](http://webpy.org) that allows one to convert an ODT document written according to the [simple  guidelines](https://rawgit.com/essepuntato/rash/master/documentation/rash-in-odt.odt) into RASH, and from RASH into LaTeX compliant with the [Springer LNCS LaTeX class](https://www.springer.com/computer/lncs?SGWID=0-164-6-793341-0) and [ACM ICPS class](https://www.acm.org/publications/proceedings-template).

For running the service, one has to call the script ``start.sh`` followed by the port where to made available the service, e.g.:

<pre><code>./start.sh 9000</code></pre>

For using the service, open a browser and access to the URL ``http://localhost:[port]/rocs``. If you call the service as suggested above on the port 9000, the URL to access with the browser will be ``http://localhost:9000/rocs``.


## Online version

An online version of *ROCS* is available at http://dasplab.cs.unibo.it/rocs.