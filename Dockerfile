FROM node:latest

WORKDIR /usr/src/app

COPY . ./

RUN npm install
RUN npm run dbgenerate
RUN npm run build

CMD [ "node", ".output/server/index.mjs" ]