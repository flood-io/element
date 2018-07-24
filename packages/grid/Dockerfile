FROM node:9 as builder

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq 
RUN apt-get update && apt-get install -y --no-install-recommends 

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN \ 
    # apt-get install -y wget --no-install-recommends \
    # && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    # && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        wget \
        curl \
        libgconf-2-4 \
        apt-utils \
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
    &&\
    rm -rf /var/lib/apt/lists/* \
    &&\
    # && apt-get purge --auto-remove -y curl \
    &&\
    rm -rf /src/*.deb

RUN curl -sLO https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb \
    && rm -rf google-chrome-stable_current_amd64.deb

# It's a good idea to use dumb-init to help prevent zombie chrome processes.
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# RUN apt-get update && apt-get install -y \
#   apt-transport-https \
#   ca-certificates \
#   curl \
#   gnupg \
#   gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
# --no-install-recommends \
# && curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
# && echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# RUN apt-get update && apt-get install -y \
#   google-chrome-stable \
#   --no-install-recommends

# # Add Chrome as a user
# RUN groupadd -r chrome && useradd -r -g chrome -G audio,video chrome \
#     && mkdir -p /home/chrome && chown -R chrome:chrome /home/chrome

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

ADD . ./

ARG FLOOD_CHROME_VERSION
ARG FLOOD_CHROME_CHANNEL
ENV FLOOD_CHROME_VERSION=${FLOOD_CHROME_VERSION} FLOOD_CHROME_CHANNEL=${FLOOD_CHROME_CHANNEL}
RUN npm run build

ENV USE_SYSTEM_CHROMIUM=true
ENV NO_CHROME_SANDBOX=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true


FROM node:9-slim

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4
RUN apt-get update && apt-get install -y --no-install-recommends apt-utils

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    # && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    # && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y curl fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libgtk-3-0 libnspr4 libnss3 \
      libx11-xcb1  libxss1  libxtst6 lsb-release xdg-utils \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    # && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

RUN curl -sLO https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb \
    && rm -rf google-chrome-stable_current_amd64.deb

# It's a good idea to use dumb-init to help prevent zombie chrome processes.
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
ARG FLOOD_CHROME_VERSION
ARG FLOOD_CHROME_CHANNEL
ENV FLOOD_CHROME_VERSION=${FLOOD_CHROME_VERSION} FLOOD_CHROME_CHANNEL=${FLOOD_CHROME_CHANNEL}

ENV USE_SYSTEM_CHROMIUM=true
ENV NO_CHROME_SANDBOX=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production
WORKDIR /app/dist

COPY --from=builder /app/package.json /app/yarn.lock /tmp/
RUN cd /tmp && yarn install --production --prefer-offline \
    && cp -a /tmp/node_modules /tmp/package.json /tmp/yarn.lock /app/dist/ \
    && rm -rf /tmp/node_modules

COPY --from=builder /app/dist /app/dist/

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
