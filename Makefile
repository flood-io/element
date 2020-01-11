lerna = ./node_modules/.bin/lerna

publish:
	./scripts/publish.sh

# publish from CI scripts
# the repo must be mounted at /src
publish-ci:
	./scripts/publish.sh

test-ci:
	yarn test

docker-build-local:
	docker build -t element-local-build .

docker-run-local-shell:
	docker run -it element-local-build bash

smoke-build:
	docker build --network=host -t element-smoke -f Dockerfile.smoke .

smoke: smoke-build
	docker run --network=host -it -e SMOKE_ONLY --name smoke --rm element-smoke yarn smoke

smoke-shell:
	docker run --network=host -it --name smoke-shell --rm element-smoke bash

dockerignore-test:
	docker build -t dockerignore-test -f Dockerfile.dockerignore-test .
	docker run --rm dockerignore-test
	docker rmi dockerignore-test

