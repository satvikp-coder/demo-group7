FROM node:22-bookworm-slim AS build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
COPY dsa/ /app/dsa/
COPY backend/ /app/backend/
# Public build setting only; never pass secrets as build arguments.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run lint && npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/health-static || exit 1
