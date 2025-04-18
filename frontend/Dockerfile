FROM node:16-alpine as build

# Instalacja dodatkowych pakietów
RUN apk add --no-cache git

# Utworzenie katalogu aplikacji
WORKDIR /app

# Kopiowanie plików konfiguracyjnych
COPY package*.json ./

# Instalacja zależności
RUN npm install --legacy-peer-deps

# Kopiowanie kodu źródłowego
COPY . .

# Budowanie aplikacji
RUN npm run build

# Etap 2: Serwowanie aplikacji za pomocą serwera nginx
FROM nginx:alpine

# Kopiowanie zbudowanej aplikacji z etapu build
COPY --from=build /app/build /usr/share/nginx/html

# Kopiowanie konfiguracji nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ekspozycja portu 80
EXPOSE 80

# Uruchomienie nginx
CMD ["nginx", "-g", "daemon off;"]
