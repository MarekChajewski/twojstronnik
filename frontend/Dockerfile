# Budowanie statycznej strony Astro.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# Gdy dołożysz package-lock.json, przełączamy się na npm ci (powtarzalny build).
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
COPY . .
RUN npm run build && npm run seo:check

# Minimalny kontener z gotowymi plikami HTML/CSS/JS.
FROM nginx:stable-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
