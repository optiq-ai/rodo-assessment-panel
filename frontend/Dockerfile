FROM node:16-alpine

WORKDIR /app

# Kopiowanie plików konfiguracyjnych
COPY package*.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie kodu źródłowego
COPY . .

# Ustawienie zmiennej środowiskowej, aby uniknąć problemów z uprawnieniami
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Ekspozycja portu 3000
EXPOSE 3000

# Uruchomienie aplikacji
CMD ["npm", "start"]
