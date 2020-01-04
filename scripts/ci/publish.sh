#!/usr/bin/env bash

set -eo pipefail

[ -n "${VERBOSE}" ] && set -x

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
source "${HERE}/defaults.sh"

echo "~~~ tests passed, publishing"
docker run --rm \
  --network=host \
  -e NPM_TOKEN \
  -e GITHUB_TOKEN \
  -e GIT_EMAIL \
  -e GIT_USERNAME \
  -e BUILDKITE_BRANCH \
  -e BUILDKITE_COMMIT \
  -e DEBUG \
  -e MASTER_SEMVER_BUMP \
  --env-file "${HERE}/test-env" "${DOCKER_IMAGE}" make publish-ci
