#!/bin/bash

BASEDIR=$(dirname $0)
echo ${BASEDIR}
aglio -i ${BASEDIR}/ign-api.md -o ${BASEDIR}/ign-api.html --theme-template ${BASEDIR}/index.jade --theme-full-width