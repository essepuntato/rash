#!/bin/bash
# This script creates the zip package of the current distribution of RASH.
SCRIPTPATH=`dirname $0`
mkdir $SCRIPTPATH/rash
mkdir $SCRIPTPATH/rash/documentation
cp $SCRIPTPATH/../documentation/index.html $SCRIPTPATH/rash/documentation
cp -rf $SCRIPTPATH/../documentation/img $SCRIPTPATH/rash/documentation
cp -rf $SCRIPTPATH/../examples $SCRIPTPATH/rash
cp -rf $SCRIPTPATH/../fonts $SCRIPTPATH/rash
cp -rf $SCRIPTPATH/../css $SCRIPTPATH/rash
cp -rf $SCRIPTPATH/../js $SCRIPTPATH/rash
mkdir $SCRIPTPATH/rash/grammar
cp $SCRIPTPATH/../grammar/rash.rn* $SCRIPTPATH/rash/grammar
zip -r $SCRIPTPATH/../rash.zip $SCRIPTPATH/rash
rm -rf $SCRIPTPATH/rash