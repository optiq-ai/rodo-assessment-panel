FROM node:16-alpine

WORKDIR /app

# Kopiowanie plików konfiguracyjnych
COPY package*.json ./

# Instalacja zależności
RUN npm install

# Tworzenie katalogów cache z odpowiednimi uprawnieniami przed kopiowaniem kodu
RUN mkdir -p /app/node_modules/.cache && \
    chmod -R 777 /app/node_modules/.cache && \
    chmod -R 777 /app/node_modules

# Kopiowanie kodu źródłowego
COPY . .

# Ponowne ustawienie uprawnień po skopiowaniu kodu
RUN chmod -R 777 /app/node_modules/.cache && \
    chmod -R 777 /app/node_modules

# Ustawienie zmiennej środowiskowej, aby uniknąć problemów z uprawnieniami
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
# Dodatkowe zmienne dla ESLint
ENV DISABLE_ESLINT_PLUGIN=true
ENV ESLINT_NO_DEV_ERRORS=true

# Ekspozycja portu 3000
EXPOSE 3000

# Uruchomienie aplikacji z niższymi uprawnieniami
CMD ["npm", "start"]
