# build stage
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# runtime stage — nginx serves the built files
FROM nginx:alpine AS runtime
COPY --from=build /app/dist/trip-client-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80