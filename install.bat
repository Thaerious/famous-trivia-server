#!/bin/bash
cp accessory/trivia.service /etc/systemd/system
sed -i "s/<USER>/"$1"/g" /etc/systemd/system/trivia.service
sed -i "s#<WD>#"$(pwd)"#g" /etc/systemd/system/trivia.service
sed -i "s#<NODE>#"$(which node)"#g" /etc/systemd/system/trivia.service