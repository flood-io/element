#!/bin/bash

set -euo pipefail
set +x
[[ ${DEBUG:-} ]] && set -x

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
source $HERE/config.sh

test_env_file=$HERE/test-env

echo pwd
pwd
ls -la .

echo "~~~ tests passed, publishing"
cp -a ./.git /build/element-dot-git
docker run --rm -e NPM_TOKEN -e GITHUB_TOKEN -e BUILDKITE_BRANCH -v /home/core/build:/build --env-file $test_env_file $DOCKER_IMAGE make publish-ci
