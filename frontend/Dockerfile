FROM node:16-alpine

# Instalacja dodatkowych pakietów
RUN apk add --no-cache git

# Utworzenie użytkownika node z odpowiednimi uprawnieniami
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

# Przełączenie na użytkownika node
USER node

# Kopiowanie plików konfiguracyjnych
COPY --chown=node:node package*.json ./

# Instalacja zależności jako użytkownik node
RUN npm install --legacy-peer-deps

# Kopiowanie kodu źródłowego jako użytkownik node
COPY --chown=node:node . .

# Tworzenie katalogu public z niezbędnymi plikami, jeśli nie istnieją
RUN mkdir -p /app/public
RUN test -f /app/public/index.html || echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GDPR Assessment Panel</title></head><body><div id="root"></div></body></html>' > /app/public/index.html
RUN test -f /app/public/manifest.json || echo '{"short_name":"GDPR Panel","name":"GDPR Assessment Panel","icons":[],"start_url":".","display":"standalone","theme_color":"#000000","background_color":"#ffffff"}' > /app/public/manifest.json

# Ustawienie zmiennych środowiskowych dla lepszej kompatybilności
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
# Całkowite wyłączenie ESLint w środowisku deweloperskim
ENV DISABLE_ESLINT_PLUGIN=true
ENV ESLINT_NO_DEV_ERRORS=true
ENV DANGEROUSLY_DISABLE_HOST_CHECK=true
ENV SKIP_PREFLIGHT_CHECK=true

# Ekspozycja portu 3000
EXPOSE 3000

# Uruchomienie aplikacji
CMD ["npm", "start"]
