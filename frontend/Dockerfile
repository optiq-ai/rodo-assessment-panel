FROM node:16-alpine

# Instalacja dodatkowych pakietów
RUN apk add --no-cache git

# Utworzenie katalogu aplikacji
WORKDIR /app

# Kopiowanie plików konfiguracyjnych i skryptu naprawiającego
COPY package*.json ./
COPY fix-ajv.js ./

# Instalacja zależności
RUN npm install --legacy-peer-deps

# Uruchomienie skryptu naprawiającego ajv po instalacji zależności
RUN node fix-ajv.js

# Kopiowanie kodu źródłowego
COPY . .

# Tworzenie katalogu public z niezbędnymi plikami
RUN mkdir -p /app/public
RUN test -f /app/public/index.html || echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GDPR Assessment Panel</title></head><body><div id="root"></div></body></html>' > /app/public/index.html
RUN test -f /app/public/manifest.json || echo '{"short_name":"GDPR Panel","name":"GDPR Assessment Panel","icons":[],"start_url":".","display":"standalone","theme_color":"#000000","background_color":"#ffffff"}' > /app/public/manifest.json

# Ustawienie zmiennych środowiskowych
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV ESLINT_NO_DEV_ERRORS=true
ENV DANGEROUSLY_DISABLE_HOST_CHECK=true
ENV SKIP_PREFLIGHT_CHECK=true
ENV WDS_SOCKET_PORT=0
ENV NODE_OPTIONS=--openssl-legacy-provider

# Ekspozycja portu 3000
EXPOSE 3000

# Uruchomienie aplikacji z dodatkowym skryptem naprawiającym
CMD ["sh", "-c", "node fix-ajv.js && npm start"]
