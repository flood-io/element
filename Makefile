GITHUB_TOKEN = $(shell cat ~/.github-token)
NPM_TOKEN = $(shell cat ~/.npm-token)
lerna = ./node_modules/.bin/lerna

publish:
	./scripts/publish.sh

publish-ci:
	echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
	./scripts/publish.sh

test-ci:
	yarn test

docker-build-local:
	docker build --build-arg GITHUB_TOKEN=${GITHUB_TOKEN} --build-arg NPM_TOKEN=${NPM_TOKEN} -t element-local-build .

docker-run-local-shell:
	docker run -it element-local-build bash

smoke-build:
	docker build -t element-smoke -f Dockerfile.smoke .

smoke: smoke-build
	docker run -it --name smoke --rm element-smoke yarn smoke

smoke-shell:
	docker run -it --name smoke-shell --rm element-smoke bash

dockerignore-test:
	docker build -t dockerignore-test -f Dockerfile.dockerignore-test .
	docker run --rm dockerignore-test
	docker rmi dockerignore-test

