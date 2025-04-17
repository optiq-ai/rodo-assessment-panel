FROM node:14.17.0-alpine

# Instalacja dodatkowych pakietów
RUN apk add --no-cache git

# Utworzenie katalogu aplikacji z odpowiednimi uprawnieniami
WORKDIR /app

# Kopiowanie plików konfiguracyjnych
COPY package*.json ./

# Instalacja konkretnych wersji problematycznych zależności przed główną instalacją
RUN npm install ajv@8.12.0 ajv-keywords@5.1.0 --no-package-lock --no-save

# Instalacja zależności z pełnym czyszczeniem cache
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --force && \
    npm install --save @fortawesome/fontawesome-svg-core@latest @fortawesome/free-solid-svg-icons@latest @fortawesome/react-fontawesome@latest --legacy-peer-deps --force

# Ręczne utworzenie brakującego katalogu dla ajv
RUN mkdir -p /app/node_modules/ajv/dist/compile
RUN echo 'module.exports = require("ajv/lib/compile/codegen");' > /app/node_modules/ajv/dist/compile/codegen.js

# Kopiowanie kodu źródłowego
COPY . .

# Tworzenie katalogu public z niezbędnymi plikami, jeśli nie istnieją
RUN mkdir -p /app/public
RUN test -f /app/public/index.html || echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GDPR Assessment Panel</title></head><body><div id="root"></div></body></html>' > /app/public/index.html
RUN test -f /app/public/manifest.json || echo '{"short_name":"GDPR Panel","name":"GDPR Assessment Panel","icons":[],"start_url":".","display":"standalone","theme_color":"#000000","background_color":"#ffffff"}' > /app/public/manifest.json

# Ustawienie zmiennych środowiskowych dla lepszej kompatybilności
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV ESLINT_NO_DEV_ERRORS=true
ENV DANGEROUSLY_DISABLE_HOST_CHECK=true
ENV SKIP_PREFLIGHT_CHECK=true
ENV WDS_SOCKET_PORT=0

# Ekspozycja portu 3000
EXPOSE 3000

# Uruchomienie aplikacji z opcją --openssl-legacy-provider dla starszych wersji Node
CMD ["npm", "start"]
