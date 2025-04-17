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
RUN npm install --save @fortawesome/fontawesome-svg-core@latest @fortawesome/free-solid-svg-icons@latest @fortawesome/react-fontawesome@latest
# Instalacja dodatkowych zależności potrzebnych do wykresów i eksportu PDF
RUN npm install --save react-chartjs-2 chart.js jspdf jspdf-autotable html2canvas

# Kopiowanie kodu źródłowego jako użytkownik node
COPY --chown=node:node . .

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
