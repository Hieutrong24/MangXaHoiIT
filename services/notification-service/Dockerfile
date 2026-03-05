FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src ./src

ENV NODE_ENV=production

EXPOSE 8005

CMD ["node", "src/server.js"]
