#!/bin/bash
ls -1 ../../testbed/odt/*.odt |
while read odt; do
	if [ ! -d out ]; then
		mkdir out 
	fi
	java -jar bin/odt2rash.jar -i $odt -o out/
done 


