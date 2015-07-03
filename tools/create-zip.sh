#!/bin/bash
# This script creates the zip package of the current distribution of RASH.
mkdir rash
mkdir rash/documentation
cp ../documentation/index.html rash/documentation
cp -rf ../documentation/img rash/documentation
cp -rf ../examples rash
cp -rf ../fonts rash
cp -rf ../css rash
cp -rf ../js rash
mkdir rash/grammar
cp ../grammar/rash.rn* rash/grammar
zip -r ../rash.zip rash
rm -rf rash