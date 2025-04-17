FROM node:16-alpine

WORKDIR /app

# Kopiowanie plików konfiguracyjnych
COPY package*.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie kodu źródłowego
COPY . .

# Ekspozycja portu 3000
EXPOSE 3000

# Uruchomienie aplikacji
CMD ["npm", "start"]
