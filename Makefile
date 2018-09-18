lerna = ./node_modules/.bin/lerna

publish:
	./scripts/publish.sh

# publish from CI scripts
# the repo must be mounted at /src
publish-ci:
	cp -a /src/.git /app/.git
	./scripts/publish.sh

test-ci:
	yarn test

docker-build-local:
	docker build -t element-local-build .

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

