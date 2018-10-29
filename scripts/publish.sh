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
  git config --global user.email ${GIT_EMAIL}
  git config --global user.name ${GIT_USERNAME}

  git remote set-url origin https://${GITHUB_TOKEN}:x-oauth-basic@github.com/flood-io/element
  cat .git/config
  git fetch

  # if the branch exists, just check it out
  if git rev-parse $BUILDKITE_BRANCH 2> /dev/null; then
    git checkout $BUILDKITE_BRANCH

  # otherwise checkout with track
  else
    git checkout --track origin/$BUILDKITE_BRANCH
  fi

  # ensure we're on the right commit - avoid race condition
  git reset --hard $BUILDKITE_COMMIT
  git branch
fi

npmrc=$HOME/.npmrc
if [[ ! -f $npmrc ]]; then
	echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > $npmrc
fi

# NOTE that publishing to npm is both immutable and impossible to make transactional across multiple packages
# so, the principle is to try to make our mistakes early
#
# Current order:
# lerna version - bumps versions, git commit & tag
# package build - make sure we can build
# soft commit:
# push to github - updated version & tags - fixing incorrect git is easier than fixing npm
# hard commit:
# npm publish - both packages should publish unless there's eg an intermitted network problem
# do the brew publish - can only do this once packages have been published

case $branch in
  beta|feature/open-source-everything)
    echo --- versioning beta
    yarn exec lerna -- version prerelease --force-publish --no-push --yes --ignore-changes scripts/publish.sh -m "release %s\n[skip ci]" --preid beta
    ;;
  master)
    : ${MASTER_SEMVER_BUMP:=patch}
    echo --- versioning master, incrementing $MASTER_SEMVER_BUMP level
    yarn exec lerna -- version $MASTER_SEMVER_BUMP --force-publish --no-push --yes --ignore-changes scripts/publish.sh -m "release %s\n[skip ci]"
    ;;
  *)
    echo "branch is $branch which I won't publish"
    exit 0
esac

echo '--- building @flood/element'
cd $root/packages/element
./scripts/build.sh

echo '--- publishing @flood/element-cli'
cd $root/packages/cli
yarn build

echo '--- pushing with tags'
git push
git push --tags

echo '--- building @flood/element'
cd $root/packages/element
npm publish --access public --tag $npm_tag dist

echo '--- publishing @flood/element-cli'
cd $root/packages/cli
npm publish --access public --tag $npm_tag

echo '--- publishing brew tap'
cd $root
yarn
yarn publish:brew
