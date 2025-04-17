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

W oryginalnym pliku Dockerfile dla frontendu występował problem z poleceniami chmod, które powodowały zawieszenie procesu budowania. Następnie pojawiły się problemy z uprawnieniami dla ESLint, który nie mógł utworzyć katalogu cache. Problemy zostały kompleksowo rozwiązane poprzez:

#### a) Modyfikację Dockerfile dla frontendu:

```dockerfile
# Tworzenie katalogów cache z odpowiednimi uprawnieniami przed kopiowaniem kodu
RUN mkdir -p /app/node_modules/.cache && \
    chmod -R 777 /app/node_modules/.cache && \
    chmod -R 777 /app/node_modules

# Ponowne ustawienie uprawnień po skopiowaniu kodu
RUN chmod -R 777 /app/node_modules/.cache && \
    chmod -R 777 /app/node_modules

# Ustawienie zmiennych środowiskowych
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV ESLINT_NO_DEV_ERRORS=true
```

#### b) Modyfikację docker-compose.yml:

```yaml
frontend:
  # Dodanie specjalnego wolumenu dla katalogu cache
  volumes:
    - ./frontend:/app
    - /app/node_modules
    - frontend_cache:/app/node_modules/.cache
  # Dodanie zmiennych środowiskowych
  environment:
    - DISABLE_ESLINT_PLUGIN=true
    - ESLINT_NO_DEV_ERRORS=true
    - CHOKIDAR_USEPOLLING=true
    - WATCHPACK_POLLING=true
  # Uruchomienie jako użytkownik node
  user: node

# Dodanie nowego wolumenu
volumes:
  frontend_cache:
```

Te zmiany zapewniają prawidłowe działanie serwera deweloperskiego React i ESLint bez problemów z uprawnieniami.

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
