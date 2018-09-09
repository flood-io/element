GITHUB_TOKEN = $(shell cat ~/.github-token)
NPM_TOKEN = $(shell cat ~/.npm-token)
lerna = ./node_modules/.bin/lerna

build:
	${lerna} exec yarn build

publish-pre: build
	${lerna} publish --force-publish=* --cd-version prerelease

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
