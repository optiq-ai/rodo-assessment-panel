FROM node:14-alpine

# Instalacja dodatkowych pakietów
RUN apk add --no-cache git

# Utworzenie katalogu aplikacji
WORKDIR /app

# Kopiowanie plików konfiguracyjnych
COPY package*.json ./

# Instalacja konkretnych wersji problematycznych zależności
RUN npm install ajv@8.11.0 ajv-keywords@5.1.0 webpack@5.76.0 webpack-dev-server@4.11.1 --legacy-peer-deps

# Instalacja pozostałych zależności
RUN npm install --legacy-peer-deps

# Tworzenie skryptu naprawiającego ajv
RUN echo 'const fs = require("fs"); \
const path = require("path"); \
const ajvKeywordsPath = path.resolve("./node_modules/ajv-keywords/dist/definitions/typeof.js"); \
if (fs.existsSync(ajvKeywordsPath)) { \
  let content = fs.readFileSync(ajvKeywordsPath, "utf8"); \
  content = content.replace("require(\\"ajv/dist/compile/codegen\\")", "require(\\"ajv/lib/compile/codegen\\")"); \
  fs.writeFileSync(ajvKeywordsPath, content, "utf8"); \
  console.log("Naprawiono ajv-keywords/dist/definitions/typeof.js"); \
} \
const otherFiles = [ \
  "./node_modules/ajv-keywords/dist/keywords/typeof.js", \
  "./node_modules/ajv-keywords/dist/keywords/index.js", \
  "./node_modules/ajv-keywords/dist/index.js" \
]; \
otherFiles.forEach(filePath => { \
  const fullPath = path.resolve(filePath); \
  if (fs.existsSync(fullPath)) { \
    let content = fs.readFileSync(fullPath, "utf8"); \
    if (content.includes("require(\\"ajv/dist/compile/codegen\\")")) { \
      content = content.replace("require(\\"ajv/dist/compile/codegen\\")", "require(\\"ajv/lib/compile/codegen\\")"); \
      fs.writeFileSync(fullPath, content, "utf8"); \
      console.log(`Naprawiono ${filePath}`); \
    } \
  } \
});' > /app/fix-ajv.js

# Uruchomienie skryptu naprawiającego
RUN node /app/fix-ajv.js

# Tworzenie łącza symbolicznego dla brakującego katalogu
RUN mkdir -p /app/node_modules/ajv/dist/compile
RUN echo 'module.exports = require("ajv/lib/compile/codegen");' > /app/node_modules/ajv/dist/compile/codegen.js

# Kopiowanie kodu źródłowego
COPY . .

# Ustawienie zmiennych środowiskowych
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

# Uruchomienie aplikacji z dodatkowym skryptem naprawiającym
CMD ["sh", "-c", "node /app/fix-ajv.js && npm start"]
