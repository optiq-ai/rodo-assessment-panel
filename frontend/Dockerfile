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
RUN echo '#!/usr/bin/env node\n\
const fs = require("fs");\n\
const path = require("path");\n\
\n\
const ajvKeywordsPath = path.resolve("./node_modules/ajv-keywords/dist/definitions/typeof.js");\n\
if (fs.existsSync(ajvKeywordsPath)) {\n\
  let content = fs.readFileSync(ajvKeywordsPath, "utf8");\n\
  content = content.replace("require(\\"ajv/dist/compile/codegen\\")", "require(\\"ajv/lib/compile/codegen\\")");\n\
  fs.writeFileSync(ajvKeywordsPath, content, "utf8");\n\
  console.log("Naprawiono ajv-keywords/dist/definitions/typeof.js");\n\
}\n\
\n\
const otherFiles = [\n\
  "./node_modules/ajv-keywords/dist/keywords/typeof.js",\n\
  "./node_modules/ajv-keywords/dist/keywords/index.js",\n\
  "./node_modules/ajv-keywords/dist/index.js"\n\
];\n\
\n\
otherFiles.forEach(filePath => {\n\
  const fullPath = path.resolve(filePath);\n\
  if (fs.existsSync(fullPath)) {\n\
    let content = fs.readFileSync(fullPath, "utf8");\n\
    if (content.includes("require(\\"ajv/dist/compile/codegen\\")")) {\n\
      content = content.replace("require(\\"ajv/dist/compile/codegen\\")", "require(\\"ajv/lib/compile/codegen\\")");\n\
      fs.writeFileSync(fullPath, content, "utf8");\n\
      console.log(`Naprawiono ${filePath}`);\n\
    }\n\
  }\n\
});' > /app/fix-ajv.js

# Nadanie uprawnień wykonywania dla skryptu
RUN chmod +x /app/fix-ajv.js

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
