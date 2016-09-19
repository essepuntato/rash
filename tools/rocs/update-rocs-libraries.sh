#!/bin/bash
# This script update all the libraries used by ROCS to the new versions.
SCRIPTPATH=`dirname $0`
rm -rf $SCRIPTPATH/libraries

mkdir $SCRIPTPATH/libraries
mkdir $SCRIPTPATH/libraries/acm_icps
cp $SCRIPTPATH/../../cls/sig-alternate.cls $SCRIPTPATH/libraries/acm_icps
cp $SCRIPTPATH/../../sty/csscolor.sty $SCRIPTPATH/libraries/acm_icps
cp $SCRIPTPATH/../../sty/pmml-new.sty $SCRIPTPATH/libraries/acm_icps
cp $SCRIPTPATH/../../xslt/acm-icps.xsl $SCRIPTPATH/libraries
cp $SCRIPTPATH/../call-saxon.sh $SCRIPTPATH/libraries
cp -rf $SCRIPTPATH/../../xslt/include $SCRIPTPATH/libraries
cp -rf $SCRIPTPATH/../lib $SCRIPTPATH/libraries
cp $SCRIPTPATH/../odt2rash/bin/odt2rash.jar $SCRIPTPATH/libraries
cp $SCRIPTPATH/../../grammar/rash.rng $SCRIPTPATH/libraries
mkdir $SCRIPTPATH/libraries/springer_lncs
cp $SCRIPTPATH/../../cls/llncs.cls $SCRIPTPATH/libraries/springer_lncs
cp $SCRIPTPATH/../../sty/csscolor.sty $SCRIPTPATH/libraries/springer_lncs
cp $SCRIPTPATH/../../sty/pmml-new.sty $SCRIPTPATH/libraries/springer_lncs
cp $SCRIPTPATH/../../xslt/springer-lncs.xsl $SCRIPTPATH/libraries
mkdir $SCRIPTPATH/libraries/acm_journal_large
cp $SCRIPTPATH/../../cls/acmlarge.cls $SCRIPTPATH/libraries/acm_journal_large
cp $SCRIPTPATH/../../sty/* $SCRIPTPATH/libraries/acm_journal_large
cp $SCRIPTPATH/../../xslt/acm-journal-large.xsl $SCRIPTPATH/libraries
