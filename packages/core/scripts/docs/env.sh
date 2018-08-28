env | grep BUILDKITE > .env
env | grep CI >> .env
env | grep GITHUB_TOKEN >> .env
env | grep NPM_TOKEN >> .env

echo NODE_ENV=test >> .env
REVISION=${BUILDKITE_COMMIT:0:8}
DOCKER_IMAGE=floodio/flood-chrome:${REVISION:=latest}

echo "--- Print .env"
cat .env
