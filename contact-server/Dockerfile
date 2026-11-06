FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --no-audit --no-fund; else npm install --omit=dev --no-audit --no-fund; fi
COPY src/ ./src/
USER node
EXPOSE 3107
# Nie używamy npm start, bo dotychczasowy skrypt lokalny czyta .env z dysku.
# Kontener pobiera sekrety przez env_file w Compose — bez pliku .env w obrazie.
CMD ["node", "src/index.mjs"]
