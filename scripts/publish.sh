#!/bin/bash

set -euo pipefail
[[ ${DEBUG:-} ]] && set -x

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
root=$HERE/..

cd $root

branch=
if [[ ${BUILDKITE_BRANCH:-} ]]; then
  branch=$BUILDKITE_BRANCH
else
  branch=$(git rev-parse --abbrev-ref HEAD)
fi

npm_tag=
case $branch in
  beta|feature/open-source-everything)
    echo --- versioning beta
    npm_tag=beta
    ;;
  master)
    echo --- versioning master
    npm_tag=latest
    ;;
  *)
    echo "--- branch is $branch which I won't publish"
    exit 0
    ;;
esac

if [[ ${BUILDKITE_BRANCH:-} ]]; then
  cd $root

  git config --global url."https://github.com".insteadOf git://github.com
  git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/"
  git config --global user.email "accounts@flood.io"
  git config --global user.name "flud-buildbox"

  git remote set-url origin https://${GITHUB_TOKEN}:x-oauth-basic@github.com/flood-io/element
  cat .git/config
  git fetch
  git checkout --track origin/$BUILDKITE_BRANCH
  # ensure we're on the right commit - avoid race condition
  git reset --hard $BUILDKITE_COMMIT
  git branch
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
npm publish --access public --tag $npm_tag dist

echo '--- publishing @flood/element-cli'
cd $root/packages/cli
yarn build
npm publish --access public --tag $npm_tag

echo '--- pushing new tags'
git push

echo '--- publishing brew tap'
cd $root
yarn
yarn publish:brew
