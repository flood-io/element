#!/bin/bash

set -euo pipefail

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
root=$HERE/..

yarn exec lerna version --force-publish --no-push --yes prerelease

cd $root/packages/element
./scripts/build.sh
yarn publish dist

cd $root/packages/cli
yarn publish

git push

# TODO brew publish
