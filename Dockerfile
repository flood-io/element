FROM node:9

ARG GITHUB_TOKEN
ARG NPM_TOKEN
RUN apt-get update && apt-get install -y \
         git \
    && rm -rf /var/lib/apt/lists/* \
    \
    && git config --global url."https://github.com".insteadOf git://github.com \
    && git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/" \
    \
    && echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc

WORKDIR /app
ADD package.json yarn.lock ./

RUN yarn 

ADD ./ ./
RUN node_modules/.bin/lerna bootstrap
