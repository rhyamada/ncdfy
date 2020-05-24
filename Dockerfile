FROM node:lts
RUN npm install -g @vue/cli @vue/cli-init @quasar/cli
WORKDIR /app
COPY . /app
RUN npm install
