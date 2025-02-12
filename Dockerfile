FROM node:lts as build
ARG TARGET_ENVIRONMENT="staging"
WORKDIR /usr/src/app
RUN sh -c '[ -z "$http_proxy" ] || ( npm config set proxy $http_proxy; npm config set https-proxy $http_proxy )'
COPY package.json ./
RUN npm install
COPY ./vite.config.ts ./svelte.config.js ./
COPY ./src ./src
COPY ./static ./static

RUN VITE_TARGET_ENVIRONMENT=${TARGET_ENVIRONMENT} npm run build

FROM node:lts AS deploy

WORKDIR /app

COPY --from=build /usr/src/app/build build/
COPY --from=build /usr/src/app/package.json .

EXPOSE 3000

ENV NODE_ENV=production

CMD [ "node", "build" ]
