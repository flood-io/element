#!/bin/bash

set -euo pipefail

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
root=$HERE/..

branch=$(git rev-parse --abbrev-ref HEAD)

case $branch in
  beta,feature/open-source-everything)
    yarn exec lerna version --force-publish --no-push --allow-branch beta --allow-branch feature/open-source-everything --preid beta --ignore-changes scripts/publish.sh prerelease
    ;;
  master)
    yarn exec lerna version --force-publish --no-push --allow-branch master --ignore-changes scripts/publish.sh patch
    ;;
esac

version=$(cat $root/lerna.json | jq .version)

cd $root/packages/element
./scripts/build.sh
npm publish --access public dist

cd $root/packages/cli
npm publish --access public

git push

# TODO brew publish
cd $root
yarn publish:brew
