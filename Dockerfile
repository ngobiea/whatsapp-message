FROM node

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm install -g concurrently

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]