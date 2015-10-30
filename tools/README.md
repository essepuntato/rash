# Tools for RASH

The tools included in this directory allows to process RASH documents in order to check its validity against the formal grammar, convert it from/to different formats, and enhance it with additional RDF statements. In this page only the "sh" scripts are described, while the tools included in the various directories have their proper README file.

## create-zip.sh

This script creates the zip package of the current distribution of RASH.

## rash-check.sh

This tool checks RASH documents against both the requirements in the RASH
specification and the full requirements in the HTML specification.

<pre>
Usage:
  rash-check.sh [-h] [-p html|xml] <FILENAME>.html
  rash-check.sh [-h] [-p html|xml] <FILENAME>.xhtml

Options:
  -h  Emit this usage statement.

  -o  json|html|xml|xhtml|text
      Output results in the format specified. [Default: gnu]

  -p  html|xml
      Force the checker to use the indicated parser. (Overrides the automatic-
      parser-selection-based-on-file-extension behavior described above).

  -w  Show warnings and info-level messages, not just errors. (By default,
      without this option specified, only error messages are shown).
</pre>

If you supply a `*.html` filename, the checker parses it with an HTML parser.
If you supply a `*.xhtml` filename or a filename with any other extension, the
checker parses it with an XML parser. Use the `-p` option to override this.

## rash-update.sh

This tool allows one to update an input RASH document compliant with an old version of the RASH grammar according to the earliest available version.

<pre>
Usage:
  rash-update.sh -s:[input RASH file] -o:[output RASH file]
</pre>

