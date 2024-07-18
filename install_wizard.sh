#!/bin/bash

# Define variables
repository_url="https://github.com/example/repository.git"  # Replace with your repository URL
destination_folder="my_wizard_folder"  # Replace with your desired destination folder name

# Initialize a new Git repository
git init $destination_folder
cd $destination_folder

# Enable sparse-checkout and configure it
git config core.sparseCheckout true

# Specify the folder you want to download (wizard)
echo "wizard/*" >> .git/info/sparse-checkout

# Clone the repository with depth 1
git remote add origin $repository_url
git pull --depth=1 origin master

# Check if 'wizard' folder exists and show its contents
if [ -d "wizard" ]; then
    echo "'wizard' folder contents:"
    ls -la wizard
else
    echo "Error: 'wizard' folder not found."
    exit 1
fi
