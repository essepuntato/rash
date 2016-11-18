#!/usr/bin/env bash
mvn compile && mvn exec:java -Dexec.args="-i $1 -o $2"
