#!/bin/bash

set -euo pipefail
set +x
[[ ${DEBUG:-} ]] && set -x

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
source $HERE/config.sh

make smoke
