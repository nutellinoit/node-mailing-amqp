#!/bin/bash

forever stopall

#forever start -a -l $PWD/LOGS/server.log -e $PWD/LOGS/error.log server.js

service postfix start

forever start -a -l $PWD/LOGS/subscriber.log -e $PWD/LOGS/error.log subscriber.js

forever start -a -l $PWD/LOGS/publisher.log -e $PWD/LOGS/error.log publisher.js


forever list
