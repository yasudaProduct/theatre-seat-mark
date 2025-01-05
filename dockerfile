FROM node:22-alpine3.20

WORKDIR /app

COPY ./package.json /app

RUN npm install