FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV HTTPS_PORT=8443

EXPOSE 3000 8443

CMD ["npm", "start"]
