env | grep BUILDKITE || true

SHA="${BUILDKITE_COMMIT:-$(git rev-parse HEAD)}"
SHORT_SHA=${SHA:0:8}
BRANCH="${BUILDKITE_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"

DOCKER_IMAGE=element-npm-build
DOCKER_IMAGE_TAG=$SHORT_SHA
