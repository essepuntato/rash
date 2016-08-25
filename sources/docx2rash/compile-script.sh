#!/usr/bin/env bash
mvn compile && clear && mvn exec:java -Dexec.args="-i $1 -o $2"
