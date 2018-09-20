#!/bin/bash

set -euo pipefail
[[ ${DEBUG:-} ]] && set -x

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
root=$HERE/..

cd $root

branch=
if [[ ${BUILDKITE_BRANCH:-} ]]; then
  branch=$BUILDKITE_BRANCH

  git config --global url."https://github.com".insteadOf git://github.com
  git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/"
  git config --global user.email "accounts@flood.io"
  git config --global user.name "flud-buildbox"


  # copy the repo so as not to disrupt buildkite checkout
  cp -a . /app-checkout
  root=/app-checkout

  cd $root
  git remote set-url origin https://${GITHUB_TOKEN}:x-oauth-basic@github.com/flood-io/element
  cat .git/config
  git fetch
  git checkout --track origin/$BUILDKITE_BRANCH
  # ensure we're on the right commit - avoid race condition
  git reset --hard $BUILDKITE_COMMIT
  git branch
else
  branch=$(git rev-parse --abbrev-ref HEAD)
fi

npmrc=$HOME/.npmrc
if [[ ! -f $npmrc ]]; then
	echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > $npmrc
fi

case $branch in
  beta|feature/open-source-everything)
    echo --- versioning beta
    yarn exec lerna -- version prerelease --force-publish --no-push --yes --ignore-changes scripts/publish.sh -m 'release %s\n[skip ci]' --allow-branch beta --allow-branch feature/open-source-everything --preid beta
    ;;
  master)
    echo --- versioning master
    yarn exec lerna -- version patch --force-publish --no-push --yes --ignore-changes scripts/publish.sh -m 'release %s\n[skip ci]' --allow-branch master
    ;;
  *)
    echo "branch is $branch which I won't publish"
    exit 0
esac

echo '--- publishing @flood/element'
cd $root/packages/element
./scripts/build.sh
npm publish --access public dist

echo '--- publishing @flood/element-cli'
cd $root/packages/cli
npm publish --access public

echo '--- pushing new tags'
git push

echo '--- publishing brew tap'
cd $root
yarn publish:brew
