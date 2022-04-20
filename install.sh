#!/bin/bash

# update & upgrade
sudo apt update && sudo apt upgrade -y

# install npm
sudo apt install npm -y

# install D3
sudo apt install libjs-d3 -y

#install node.js
sudo apt install node.js -y

# install Nginx
sudo apt install nginx -y

# install frontend
cd frontend
npm install
cd ..

# install backend
cd backend
npm install
cd ..
