FROM node:22

WORKDIR /app

COPY package*.json .
COPY pnpm-lock.yaml .

RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm run build

EXPOSE ${PORT}

CMD ["pnpm", "run", "dev"]
