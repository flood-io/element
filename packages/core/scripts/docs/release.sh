#!/bin/bash
# set -e
set +x

. $(dirname $0)/env.sh

echo "~~~ Docker build"
docker build -t $DOCKER_IMAGE .

echo "+++ :github: :npm: Release"
# docker run --rm --env-file .env $DOCKER_IMAGE npx semantic-release && echo OK || exit 1
# docker run --rm --env-file .env floodio/dashboard:${REVISION} ember deploy ${TARGET} ${ACTIVATE} --verbose
