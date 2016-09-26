#!/bin/bash
ps -ef | grep "[r]ocs.py" | awk '{print $2}' | xargs kill
