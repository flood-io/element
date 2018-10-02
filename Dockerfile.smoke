FROM node:10

RUN apt-get update \
      && apt-get install -y --no-install-recommends \
        libgconf-2-4 \
        apt-utils \
        wget \
        curl \
        git \
        fonts-ipafont-gothic \
        fonts-wqy-zenhei \
        fonts-thai-tlwg \
        fonts-kacst \
        ttf-freefont \
        fonts-liberation \
        libappindicator3-1 \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libcups2 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libx11-xcb1 \
        libxss1 \
        libxtst6 \
        lsb-release \
        xdg-utils \
    \
    && rm -rf /var/lib/apt/lists/*
    # \
    # && git config --global url."https://github.com".insteadOf git://github.com \
    # && git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/" \
    # \
    # && echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc

# increment this to bust the cache when a new chrome comes out
ARG NOMINAL_CHROME_VERSION
ENV NOMINAL_CHROME_VERSION=${NOMINAL_CHROME_VERSION}

RUN curl -sLO https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb \
    && rm -rf google-chrome-stable_current_amd64.deb

ENV NO_CHROME_SANDBOX=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY ./package.json ./yarn.lock ./tsconfig.base.json /element/
RUN cd /element && yarn

COPY ./packages/cli/package.json ./packages/cli/tsconfig.json /element/packages/cli/

COPY ./packages/element/package.json ./packages/element/tsconfig.json /element/packages/element/
RUN cd /element && yarn 

COPY ./packages/cli/ /element/packages/cli/
COPY ./packages/element/ /element/packages/element/

COPY ./smoke/element-install.js /element-install.js
RUN node /element-install.js

WORKDIR /app

# ugh
COPY ./tsconfig.base.json /
COPY smoke/package.json smoke/yarn.lock smoke/tsconfig.json ./
RUN yarn

ADD smoke/ ./
