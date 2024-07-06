FROM node:18-alpine as build 

WORKDIR /app
COPY . .

WORKDIR /app/Server
RUN npm install 

EXPOSE 5001

CMD ["npm", "run", "start"]


