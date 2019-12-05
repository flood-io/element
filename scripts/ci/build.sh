#!/usr/bin/env bash

set -eo pipefail

[ -n "${VERBOSE}" ] && set -x

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
source "${HERE}/defaults.sh"

echo "--- Docker build"
docker build -t "${DOCKER_IMAGE}" .