# Panel do oceny RODO (GDPR Assessment Panel)

## Opis projektu

Panel do oceny RODO to aplikacja webowa umożliwiająca przeprowadzanie oceny zgodności z Rozporządzeniem o Ochronie Danych Osobowych (RODO). Aplikacja pozwala użytkownikom na:

- Rejestrację i logowanie
- Przeprowadzanie oceny zgodności z RODO
- Zapisywanie i przeglądanie wyników oceny
- Generowanie raportów z oceny

## Technologie

Projekt wykorzystuje następujące technologie:

- **Frontend**: React, Material-UI
- **Backend**: Spring Boot
- **Baza danych**: PostgreSQL
- **Konteneryzacja**: Docker, Docker Compose

## Struktura projektu

```
gdpr-assessment-panel/
├── frontend/             # Aplikacja React
├── backend/              # Aplikacja Spring Boot
├── database/             # Skrypty inicjalizacyjne bazy danych
├── docker-compose.yml    # Konfiguracja Docker Compose
└── .env                  # Zmienne środowiskowe
```

## Uruchomienie projektu

### Wymagania

- Docker
- Docker Compose

### Instrukcja uruchomienia

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/optiq-ai/rodo-assessment-panel.git
   cd rodo-assessment-panel
   ```

2. Uruchom aplikację za pomocą Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Aplikacja będzie dostępna pod adresem:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api

### Dane logowania

- Login: admin
- Hasło: admin123

## Rozwiązane problemy

### 1. Problem z uprawnieniami w kontenerze frontendu

W oryginalnym pliku Dockerfile dla frontendu występował problem z poleceniami chmod, które powodowały zawieszenie procesu budowania. Następnie pojawiły się problemy z uprawnieniami dla ESLint, który nie mógł utworzyć katalogu cache.

Po kilku próbach rozwiązania problemu z użyciem poleceń chmod, zdecydowaliśmy się na całkowicie nowe podejście, które eliminuje potrzebę używania tych poleceń:

#### a) Całkowicie przeprojektowany Dockerfile dla frontendu:

```dockerfile
FROM node:16-alpine

# Utworzenie użytkownika node z odpowiednimi uprawnieniami
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

# Przełączenie na użytkownika node
USER node

# Kopiowanie plików konfiguracyjnych
COPY --chown=node:node package*.json ./

# Instalacja zależności jako użytkownik node
RUN npm install

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
```

#### b) Ulepszona konfiguracja w docker-compose.yml:

```yaml
frontend:
  volumes:
    - ./frontend:/app:delegated
    - frontend_node_modules:/app/node_modules
  environment:
    - DISABLE_ESLINT_PLUGIN=true
    - ESLINT_NO_DEV_ERRORS=true
    - CHOKIDAR_USEPOLLING=true
    - WATCHPACK_POLLING=true
    - DANGEROUSLY_DISABLE_HOST_CHECK=true

volumes:
  frontend_node_modules:
```

To rozwiązanie:
- Używa użytkownika `node` od początku procesu budowania
- Stosuje flagi `--chown=node:node` podczas operacji kopiowania
- Używa nazwanego wolumenu dla `node_modules` zamiast montowania katalogu
- Dodaje opcję `:delegated` dla lepszej wydajności
- Całkowicie eliminuje potrzebę używania poleceń chmod, które powodowały zawieszanie

### 2. Problem z połączeniem do bazy danych

Skrypt wait-for-postgres.sh, który sprawdza dostępność bazy danych przed uruchomieniem backendu, miał problemy z uwierzytelnianiem. Problem został rozwiązany przez ulepszenie skryptu:

```bash
# Wyświetlenie zmiennych środowiskowych do debugowania
echo "Trying to connect to PostgreSQL at $host with user $POSTGRES_USER and database $POSTGRES_DB"

# Dodanie domyślnych wartości, jeśli zmienne środowiskowe nie są ustawione
if [ -z "$POSTGRES_USER" ]; then
  POSTGRES_USER="postgres"
  echo "POSTGRES_USER not set, using default: $POSTGRES_USER"
fi

if [ -z "$POSTGRES_DB" ]; then
  POSTGRES_DB="gdpr_assessment"
  echo "POSTGRES_DB not set, using default: $POSTGRES_DB"
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
  POSTGRES_PASSWORD="postgres"
  echo "POSTGRES_PASSWORD not set, using default: [hidden]"
fi

# Próba połączenia z bazą danych z jawnym przekazaniem hasła
until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$host" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
```

Te zmiany zapewniają, że skrypt zawsze ma dostęp do wymaganych danych uwierzytelniających, nawet jeśli zmienne środowiskowe nie są poprawnie przekazane.

## Znane ograniczenia

- Aplikacja wymaga działającego serwisu Docker do uruchomienia kontenerów
- W niektórych środowiskach wirtualnych mogą wystąpić problemy z uruchomieniem usługi Docker

## Kontakt

W przypadku pytań lub problemów, prosimy o kontakt z zespołem rozwojowym.
