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
docker run --rm -e NPM_TOKEN -e GITHUB_TOKEN -e BUILDKITE_BRANCH -v $(pwd):/src --env-file $test_env_file $DOCKER_IMAGE make publish-ci
