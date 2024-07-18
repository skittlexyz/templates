#!/bin/bash

repositoryUrl="https://github.com/skittlexyz/templates"
destinationFolder=".wizard_temp"

mkdir -p "$destinationFolder"

cd "$destinationFolder" || exit
git init

git config core.sparseCheckout true

echo "wizard/*" > .git/info/sparse-checkout

git remote add origin "$repositoryUrl"
git pull --depth=1 origin main

mv wizard/* .

go build -o ../

cd ..
rm -rf "$destinationFolder"