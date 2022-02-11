#!/bin/sh

mkdir -p tmp

# retrieve all rules from a National Backend (somehow) and put them as one long array in tmp/all-rules.json

tsc

node dist/cases/ist/migrate-rules.js

