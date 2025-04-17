FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Kopiowanie plików projektu
COPY pom.xml .
COPY src ./src

# Budowanie aplikacji
RUN mvn clean package -DskipTests

# Etap uruchomieniowy
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Kopiowanie zbudowanej aplikacji z etapu budowania
COPY --from=build /app/target/*.jar app.jar

# Ekspozycja portu 8080
EXPOSE 8080

# Uruchomienie aplikacji
CMD ["java", "-jar", "app.jar"]
