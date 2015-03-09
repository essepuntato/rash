#!/bin/sh
# rash-check.sh - fully check RASH documents

read -r -d '' USAGE <<'EOF'
\nUsage:
  rash-check.sh [-h] [-p html|xml] <FILENAME>.html
  rash-check.sh [-h] [-p html|xml] <FILENAME>.xhtml

This tool checks RASH documents against both the requirements in the RASH
specification and the full requirements in the HTML specification.

If you supply a `*.html` filename, the checker parses it with an HTML parser.
If you supply a `*.xhtml` filename or a filename with any other extension, the
checker parses it with an XML parser. Use the `-p` option to override this.

Options:
  -h  Emit this usage statement.

  -o  json|html|xml|xhtml|text
      Output results in the format specified. [Default: gnu]

  -p  html|xml
      Force the checker to use the indicated parser. (Overrides the automatic-
      parser-selection-based-on-file-extension behavior described above).

  -w  Show warnings and info-level messages, not just errors. (By default,
      without this option specified, only error messages are shown).
EOF

CHECKER=http://validator.w3.org/nu/ # more up-to-date than https://validator.nu/
#CHECKER=https://validator.nu/ # use if you get blocked by W3C rate limiting

ERRORLEVEL=error
OUTPUTFORMAT=gnu
PARSER=

# canonical URL of RASH RelaxNG grammar w/ HTML namespace as default namespace
RASH_SCHEMA=https://raw.githubusercontent.com/essepuntato/rash/master/grammar/rash.rng
# checker's built-in schemas for checking against all HTML spec requirements
HTML_SCHEMAS="http://s.validator.nu/html5-all.rnc http://s.validator.nu/html5/assertions.sch http://c.validator.nu/all/"

# provides the checker with the schemas as a set to check against in parallel
SCHEMAS="$RASH_SCHEMA $HTML_SCHEMAS"

OPTIND=1
while getopts "h?o:p:w" opt; do
  case "$opt" in
  o)
    OUTPUTFORMAT=$OPTARG
    ;;
  p)
    PARSER=$OPTARG
    ;;
  w)
    ERRORLEVEL=
    ;;
  *)
    printf "$USAGE"
    exit 0
    ;;
  esac
done

if ((OPTIND>$#)); then
  printf "$USAGE"
  exit 1
fi
shift $((OPTIND-1))
FILENAME="$*"

# for info about other params you can specify in requests to the checker,
# see https://wiki.whatwg.org/wiki/Validator.nu_Common_Input_Parameters
curl -s \
  -F laxtype=yes \
  -F level="$ERRORLEVEL"\
  -F out="$OUTPUTFORMAT" \
  -F parser="$PARSER" \
  -F schema="$SCHEMAS" \
  -F doc=@"$FILENAME" \
  "$CHECKER"
