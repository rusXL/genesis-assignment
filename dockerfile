# base image
FROM node:22-alpine

# set working directory
WORKDIR /app

# install pnpm
RUN npm install -g pnpm

# copy dependencies and install
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# copy source
COPY . .

# build the app
RUN pnpm build

# expose app port
EXPOSE 3000

CMD ["pnpm", "start:prod"]
