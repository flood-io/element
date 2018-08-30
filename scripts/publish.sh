#!/bin/bash

set -euo pipefail

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
root=$HERE/..

yarn exec lerna version --force-publish --no-push --ignore-changes scripts/publish.sh prerelease 

version=$(cat $root/lerna.json | jq .version)

cd $root/packages/element
./scripts/build.sh
yarn publish --new-version $version dist

cd $root/packages/cli
yarn publish --new-version $version

git push

# TODO brew publish
