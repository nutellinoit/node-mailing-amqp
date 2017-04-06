#!/bin/bash

if [ $# -gt 0 ]; then
   	
   	git add .
   	
   	git config --global user.name "Samuele"
   	
   	git config --global user.email "samuele@busnet.it"
   	
   	git commit -m "$@" 
   	
   	git push origin master
   	
else
    echo "Inserisci il testo del commit."
fi
