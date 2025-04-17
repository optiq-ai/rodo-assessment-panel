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

### 1. Problem z frontendem

W oryginalnym pliku Dockerfile dla frontendu występował problem z poleceniami chmod, które powodowały zawieszenie procesu budowania. Problem został rozwiązany przez zastąpienie tych poleceń zmiennymi środowiskowymi:

```dockerfile
# Przed zmianą
RUN mkdir -p /app/node_modules/.cache && \
    chmod -R 777 /app/node_modules/.cache && \
    chmod -R 777 /app/node_modules

# Po zmianie
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
```

Te zmienne środowiskowe zapewniają prawidłowe działanie serwera deweloperskiego React bez konieczności ręcznej zmiany uprawnień, co eliminuje problem z zawieszaniem się procesu budowania.

## Znane ograniczenia

- Aplikacja wymaga działającego serwisu Docker do uruchomienia kontenerów
- W niektórych środowiskach wirtualnych mogą wystąpić problemy z uruchomieniem usługi Docker

## Kontakt

W przypadku pytań lub problemów, prosimy o kontakt z zespołem rozwojowym.
