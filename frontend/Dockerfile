FROM node:14-alpine

# Instalacja dodatkowych pakietów
RUN apk add --no-cache git

# Utworzenie katalogu aplikacji
WORKDIR /app

# Kopiowanie plików konfiguracyjnych
COPY package*.json ./

# Tworzenie mocka dla ajv/dist/compile/codegen
RUN mkdir -p /tmp/mock-modules/ajv/dist/compile
RUN echo 'module.exports = { _ : { getCode: () => "return {}" } };' > /tmp/mock-modules/ajv/dist/compile/codegen.js

# Tworzenie mocka dla ajv/lib/compile/codegen
RUN mkdir -p /tmp/mock-modules/ajv/lib/compile
RUN cp /tmp/mock-modules/ajv/dist/compile/codegen.js /tmp/mock-modules/ajv/lib/compile/codegen.js

# Instalacja zależności z użyciem NODE_PATH
ENV NODE_PATH=/tmp/mock-modules
RUN npm install --legacy-peer-deps

# Kopiowanie kodu źródłowego
COPY . .

# Tworzenie skryptu do modyfikacji webpack
RUN echo '#!/usr/bin/env node\n\
const fs = require("fs");\n\
const path = require("path");\n\
\n\
// Ścieżki do plików webpack\n\
const webpackConfigPath = path.resolve("./node_modules/react-scripts/config/webpack.config.js");\n\
\n\
if (fs.existsSync(webpackConfigPath)) {\n\
  console.log("Modyfikuję konfigurację webpack...");\n\
  let content = fs.readFileSync(webpackConfigPath, "utf8");\n\
  \n\
  // Wyłączenie minimalizacji, która używa terser-webpack-plugin (zależnego od ajv)\n\
  content = content.replace(/minimize: .+?,/g, "minimize: false,");\n\
  \n\
  // Zapisanie zmodyfikowanej konfiguracji\n\
  fs.writeFileSync(webpackConfigPath, content, "utf8");\n\
  console.log("Konfiguracja webpack zmodyfikowana pomyślnie!");\n\
}\n\
\n\
// Tworzenie mocków dla problematycznych modułów\n\
const mockDirs = [\n\
  "./node_modules/ajv/dist/compile",\n\
  "./node_modules/ajv/lib/compile"\n\
];\n\
\n\
mockDirs.forEach(dir => {\n\
  const fullPath = path.resolve(dir);\n\
  if (!fs.existsSync(fullPath)) {\n\
    fs.mkdirSync(fullPath, { recursive: true });\n\
    console.log(`Utworzono katalog: ${fullPath}`);\n\
  }\n\
  \n\
  const codegenPath = path.join(fullPath, "codegen.js");\n\
  fs.writeFileSync(codegenPath, "module.exports = { _ : { getCode: () => \\"return {}\\" } };", "utf8");\n\
  console.log(`Utworzono mock dla: ${codegenPath}`);\n\
});\n\
\n\
console.log("Wszystkie modyfikacje zakończone pomyślnie!");\n\
' > /app/disable-codegen.js

# Nadanie uprawnień wykonywania dla skryptu
RUN chmod +x /app/disable-codegen.js

# Uruchomienie skryptu modyfikującego webpack
RUN node /app/disable-codegen.js

# Ustawienie zmiennych środowiskowych
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV ESLINT_NO_DEV_ERRORS=true
ENV DANGEROUSLY_DISABLE_HOST_CHECK=true
ENV SKIP_PREFLIGHT_CHECK=true
ENV WDS_SOCKET_PORT=0
ENV GENERATE_SOURCEMAP=false

# Ekspozycja portu 3000
EXPOSE 3000

# Uruchomienie aplikacji z dodatkowym skryptem wyłączającym codegen
CMD ["sh", "-c", "node /app/disable-codegen.js && DISABLE_MINIMIZE=true npm start"]
