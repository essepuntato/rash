#!/bin/bash
ps -ef | grep "rocs.py" | awk '{print $2}' | xargs kill