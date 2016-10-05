# Math2Mathml

The math2mathml.js script converts a (valid) RASH document replacing Math Formulas (defined using both LaTeX and AsciiMath notation) with their MathML equivalent and saves the converted document to the specified path.


## Usage

After opening a terminal and entering the RASH folder, using the math2mathml script is as simple as typing `phantomjs math2mathml.js -o output_path document_path"` where
* output_path is the path where you want to save the converted document and
* document_path is the path of the document you want to convert.

Please note that in order to use this script you need a working network connection as RASH loads MathJax dynamically over the Internet.


## Dependencies

In order to execute math2mathml.js you have to install [PhantomJS](http://phantomjs.org/). You also need a handful more dependencies (notably MathJax and JQuery) but you shouldn't worry about them since they are automatically taken care of by the RASH framework which embeds them in RASH documents as needed.
