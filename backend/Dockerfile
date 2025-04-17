FROM openjdk:17-jdk-slim

WORKDIR /app

# Kopiowanie plików projektu
COPY . .

# Ustawienie zmiennych środowiskowych
ENV SPRING_PROFILES_ACTIVE=dev

# Ekspozycja portu 8080
EXPOSE 8080

# Uruchomienie aplikacji
CMD ["./mvnw", "spring-boot:run"]
