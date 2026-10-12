# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot application using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy backend sources and the compiled React frontend
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
COPY --from=frontend-build /app/frontend/dist frontend/dist

# Package the application JAR (skipping unit tests for fast cloud build)
RUN mvn -f backend/pom.xml clean package -DskipTests

# Stage 3: Minimal runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy built artifact from build stage
COPY --from=build /app/backend/target/*.jar app.jar

# Expose default HTTP port
EXPOSE 8080

# Run Spring Boot
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
