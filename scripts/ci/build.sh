#!/bin/bash

set -euo pipefail
set +x
[[ ${DEBUG:-} ]] && set -x

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
source $HERE/config.sh

test_env_file=$HERE/test-env

echo "--- Docker build testing/publishing image"
docker build -t ${DOCKER_IMAGE} .
