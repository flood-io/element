#!/usr/bin/env bash

set -eo pipefail

[ -n "${VERBOSE}" ] && set -x

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
source "${HERE}/defaults.sh"

echo "~~~ running tests"
docker run --network=host --rm --env-file "${HERE}/test-env" "${DOCKER_IMAGE}" make test-ci
