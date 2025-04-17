# Panel do oceny zgodności z RODO

Aplikacja webowa do przeprowadzania oceny zgodności z Rozporządzeniem o Ochronie Danych Osobowych (RODO).

## Funkcjonalności

- System logowania i rejestracji użytkowników
- Panel do przeprowadzania oceny RODO
- Możliwość zapisywania i przeglądania wyników oceny
- Responsywny interfejs użytkownika

## Technologie

- Frontend: React, Material-UI
- Backend: Spring Boot
- Baza danych: PostgreSQL
- Konteneryzacja: Docker, Docker Compose

## Wymagania

- Docker i Docker Compose
- Git

## Instrukcja uruchomienia

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

4. Domyślne dane logowania:
   - Login: admin
   - Hasło: admin123

## Struktura projektu

- `/frontend` - Aplikacja React
- `/backend` - Aplikacja Spring Boot
- `/database` - Skrypty inicjalizacyjne bazy danych

## Licencja

Ten projekt jest udostępniany na licencji MIT.
