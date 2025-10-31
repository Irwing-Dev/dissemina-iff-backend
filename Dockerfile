FROM node:current-alpine3.22 as build

COPY . .
RUN npm i

EXPOSE 3000

ENTRYPOINT [ "npm", "start" ]

