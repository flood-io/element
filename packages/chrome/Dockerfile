FROM node:9

WORKDIR /app

COPY package*.json *.lock ./
RUN yarn install

COPY .git ./.git
COPY . .

RUN echo git branch