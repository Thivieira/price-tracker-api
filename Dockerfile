FROM node:22

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm run build

EXPOSE ${PORT}

CMD ["node", "--experimental-specifier-resolution=node", "dist/server.js"]
