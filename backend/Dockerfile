FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma
COPY scripts ./scripts

RUN npm ci

COPY tsconfig.json nest-cli.json ./
COPY src ./src

RUN node scripts/switch-db.mjs postgres && npx prisma generate && npm run build
RUN mkdir -p uploads/public uploads/private

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]
