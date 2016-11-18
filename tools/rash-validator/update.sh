#!/bin/bash
# This script update all the libraries used by RASH Validator to the new versions.
SCRIPT_PATH=`dirname $0`
SOURCES_PATH=$SCRIPT_PATH/../../sources/rash-validator
./clean.sh
mkdir $SCRIPT_PATH/bin
BIN_PATH=$SCRIPT_PATH/bin
mkdir $BIN_PATH/static
mkdir $BIN_PATH/templates
cp $SOURCES_PATH/server/*.py $BIN_PATH
cp $SOURCES_PATH/server/rashvalidator.py $SCRIPT_PATH
cp $SCRIPT_PATH/../../grammar/rash.rng $BIN_PATH
npm --prefix $SOURCES_PATH/client install
npm --prefix $SOURCES_PATH/client run build > /dev/null
mv $SOURCES_PATH/client/build/favicon.ico $BIN_PATH/templates
mv $SOURCES_PATH/client/build/index.html $BIN_PATH/templates
mv $SOURCES_PATH/client/build/static/js $BIN_PATH/static
rm -rf $SOURCES_PATH/client/build
