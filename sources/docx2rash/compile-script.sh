#!/usr/bin/env bash
mvn exec:java -Dexec.args="-i $1 -o $2"
