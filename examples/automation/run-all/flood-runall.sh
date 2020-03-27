#!/bin/bash

# flood-run-e2e.sh in https://github.com/wilsonmar/DevSecOps/tree/master/flood-io
# from https://docs.flood.io/#end-to-end-example retrieved 8 July 2019.
# to launch and run flood tests.
# Written by WilsonMar@gmail.com

# sh -c "$(curl -fsSL https://raw.githubusercontent.com/wilsonmar/DevSecOps/master/flood-io/flood-run-e2e.sh)"

# This is free software; see the source for copying conditions. There is NO
# warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

set -e  # exit script if any command returnes a non-zero exit code.
# set -x  # display every command.

# Default run parameters:
FLOOD_PROJECT="default"  # "the-internet-dev01"
GITHUB_REPO_URL="https://github.com/flood-io/element/trunk/examples/sap-fiori"

#TYPESCRIPT_URL="https://raw.githubusercontent.com/flood-io/element/master/examples/internet-herokuapp/14-Dynamic_Loading.ts"
FLOOD_REGION="us-west-1"
FLOOD_INST_TYPE="m5.xlarge"
FLOOD_SLEEP_SECS="10"

# Verify availability of Typescript file:
if wget --spider "$TYPESCRIPT_URL" 2>/dev/null; then
   echo -e "\n>>> $TYPESCRIPT_URL available."
fi

## Reset data from previous run:
unset $FLOOD_API_TOKEN
unset $FLOOD_USER

SCRIPT_FULL_PATH="$PWD/sap-fiori"
SCRIPT_FULL_PATH_DIR="$PWD"
SCRIPT_LOCAL_FOLDER="suite"

if [ -f "$SCRIPT_FULL_PATH" ]; then
   echo -e "\n>>> SCRIPT_FULL_PATH not available from previous run. Continuing..."
else
   echo -e "\n>>> SCRIPT_FULL_PATH = $SCRIPT_FULL_PATH..."
fi

## Obtain secrets from flood-run-e2e.var or other mechanism
source ~/.flood-secrets.env  # QUESTON: Where is this when invoked within Jenkins?
# PROTIP: use environment variables to pass links to where the secret is really stored: use an additional layer of indirection.
# From https://app.flood.io/account/user/security
FLOOD_USER=$FLOOD_API_TOKEN+":x"
if [ -z "$FLOOD_API_TOKEN" ]; then
   echo -e "\n>>> FLOOD_API_TOKEN not available. Exiting..."
   exit 9
else
   echo -e "\n>>> FLOOD_API_TOKEN available. Continuing..."
fi
# To sign into https://app.flood.io/account/user/security (API Access)
if [ -z "$FLOOD_USER" ]; then
   echo -e "\n>>> FLOOD_USER not available. Exiting..."
   exit 9
else
   echo -e "\n>>> FLOOD_USER available. Continuing..."
fi


# TODO: Use GitHub API to lookup and store in a file.
   # See https://developer.github.com/v3/guides/basics-of-authentication/
   # Run script for each row.

   if ! command -v brew >/dev/null; then
      echo -e "\n>>> Installing Homebrew, a pre-requisite for installing stuff on MacOS..."
      ruby -e "$( curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install )"
      brew tap caskroom/cask
   fi
   echo -e "\n>>> $( brew --version ) is installed."

   # Make sure jq is installed to make parsing JSON responses:
   if ! command -v jq >/dev/null; then
      echo -e "\n>>> Installing jq, a pre-requisite for parsing JSON within Batch scripts..."
      brew install jq  # http://stedolan.github.io/jq/download/
   fi
   echo -e "\n>>> $( jq --version ) installed."  # jq-1.6

   if ! command -v wget >/dev/null; then
      echo -e "\n>>> Installing wget, a pre-requisite for this Batch script..."
      brew install wget
   fi
   echo -e "\n>>> $( wget --version | grep "Wget " ) installed."  # 1.20.3

   if ! command -v svn >/dev/null; then
      echo -e "\n>>> Installing svn, a pre-requisite for this Batch script..."
      brew install svn
   fi
   echo -e "\n>>> $( svn --version | grep "svn " ) installed."


# TODO: Create project "the-internet-dev01" on Flood GUI
echo -e "\n>>> At $PWD"

#clone github repo with all examples
### Check if the local script folder does not exist ###
if [ ! -d $SCRIPT_LOCAL_FOLDER ] 
then
    echo -e "\n>>> creating 'suite' directory..."
    mkdir $SCRIPT_LOCAL_FOLDER
    echo -e "done."
else
    rm -rf $SCRIPT_LOCAL_FOLDER
    mkdir $SCRIPT_LOCAL_FOLDER
fi

cd $SCRIPT_LOCAL_FOLDER
echo -e "\n>>> exporting github repo scripts..."
svn export $GITHUB_REPO_URL
echo -e "\n>>> exporting github repo scripts...done."

echo ">>> Launching a Grid..."

#start a Grid to run all our tests on
grid_uuid=$( curl -u $FLOOD_API_TOKEN: -X POST https://api.flood.io/grids \
  -F "grid[region]=us-west-1" \
  -F "grid[infrastructure]=demand" \
  -F "grid[instance_quantity]=1" \
  -F "grid[stop_after]=60" \
  -F "grid[instance_type]=m5.xlarge" | jq -r ".uuid" )

#grid_uuid="IxfDZFT0jECXFDzCPqwPPw"

echo -n ">>> The grid has been requested and the ID is: $grid_uuid"
echo -n ">>> waiting for the grid to become available..."

#wait until the Grid has started
while [ $(curl --silent --user $FLOOD_API_TOKEN: -X GET https://api.flood.io/grids/$grid_uuid | jq -r '.status == "started"') = "false" ]; do
   echo -n "waiting..."
   sleep "$FLOOD_SLEEP_SECS"
done

#retrive all test script files from this location and use them to run a Flood
for f in $(find . -mindepth 1 -type f)
 do
   echo ">> CURRENT FILE: $f"

   echo -e "\n>>> [$(date +%FT%T)+00:00] assemble flood_uuid"
   
   flood_uuid=$(curl -u $FLOOD_API_TOKEN: -X POST https://api.flood.io/floods \
      -F "flood[tool]=flood-chrome" \
      -F "flood[threads]=1" \
      -F "flood[rampup]=1" \
      -F "flood[duration]=60" \
      -F "flood[privacy]=public" \
      -F "flood[project]=$FLOOD_PROJECT" \
      -F "flood[name]=Element Test" \
      -F "flood_files[]=@$f" \
      -F "flood[grids][][uuid]=$grid_uuid" | jq -r ".uuid" )

   Login=$(curl -X POST https://api.flood.io/oauth/token -F 'grant_type=password' \
      -F 'username=$FLOOD_USERNAME' -F 'password=$FLOOD_PASSWORD') #required username and password
   # echo $Login
   Token=$(echo $Login | jq -r '.access_token')
   Patch=$(curl -X PATCH https://api.flood.io/api/v3/floods/$flood_uuid/set-public -H 'Authorization: Bearer '$Token -H 'Content-Type: application/json')

   echo -e "\n>>> [$(date +%FT%T)+00:00] See dashboard at https://api.flood.io/$flood_uuid while waiting:"
   echo "    (One dot every $FLOOD_SLEEP_SECS seconds):"
   while [ $(curl --silent --user $FLOOD_API_TOKEN: -X GET https://api.flood.io/floods/$flood_uuid | jq -r '.status == "finished"') = "false" ]; do
     echo -n "."
     sleep "$FLOOD_SLEEP_SECS"
   done

   #echo "   ERROR: Authentication required to view this Flood ???"
   echo -e "\n>>> [$(date +%FT%T)+00:00] Get the summary report"
   flood_report=$(curl --silent --user $FLOOD_API_TOKEN:  -X GET https://api.flood.io/floods/$flood_uuid/report \
       | jq -r ".summary" )
   echo -e "\n>>> [$(date +%FT%T)+00:00] Detailed results at https://api.flood.io/floods/$flood_uuid"
   echo "$flood_report"  # summary report

   #Optionally store the CSV results
   #echo -e "\n>>> [$(date +%FT%T)+00:00] Storing CSV results in results.csv"
   #curl --silent --user $FLOOD_API_TOKEN: https://api.flood.io/csv/$flood_uuid/$flood_uuid \
   #   > result.csv

   #if [ ! -f result.csv ]; then
   #   echo -e "\n>>> result.csv not available. Exiting..."
   #   exit 9
   #else
   #   echo -e "\n>>> result.csv ..."
   #   head 1 result.csv
   #      # {"error":"Sorry, we cannot find that resource. If you'd like assistance please contact support@flood.io"}
   #fi

done



