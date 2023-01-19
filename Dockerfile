# syntax=docker/dockerfile:1
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./
RUN yarn install

COPY . .
RUN yarn run tsc

CMD ["node", "dist/index.js"]
EXPOSE 5000
