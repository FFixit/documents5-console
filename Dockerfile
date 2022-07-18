FROM node:current-alpine AS build

EXPOSE 8001

WORKDIR /usr/src/app

COPY --chown=node:node ./frontend ./frontend
RUN cd ./frontend && npm install && npm run build

COPY --chown=node:node ./backend ./backend
ENV NODE_ENV production
RUN cd ./backend && npm ci --omit=dev && npm cache clean --force

USER node

FROM node:current-alpine AS production

WORKDIR /usr/src/app

RUN chown node /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/backend ./backend
COPY --chown=node:node --from=build /usr/src/app/frontend/dist ./frontend/dist

ENV FRONTEND_DIST_DIR=./frontend/dist

CMD [ "node", "./backend" ]

USER node