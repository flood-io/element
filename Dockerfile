FROM node:10

# need to install packages for chrome to even
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && apt-get update \
    && apt-get install -y \
      # See https://crbug.com/795759
      libgconf-2-4 \
      apt-utils \
      curl \
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
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# ARG GITHUB_TOKEN
# RUN apt-get update && apt-get install -y \
    # git \
    # && rm -rf /var/lib/apt/lists/* \
    # \
    # && git config --global url."https://github.com".insteadOf git://github.com \
    # && git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/"

WORKDIR /app
ADD package.json yarn.lock ./
ADD packages/element/package.json ./packages/element/
ADD packages/cli/package.json  ./packages/cli/
RUN yarn

ENV NO_CHROME_SANDBOX=1

ADD ./ ./
