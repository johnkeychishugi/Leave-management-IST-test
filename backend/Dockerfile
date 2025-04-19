FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy the POM file separately to cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn package -DskipTests

FROM --platform=linux/amd64 eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create directory for document storage
RUN mkdir -p /app/uploads

# Copy JAR file from build stage
COPY --from=build /app/target/*.jar app.jar

# Environment variables with default values
ENV PORT=8080 \
    DB_URL=jdbc:postgresql://postgres:5432/lms \
    DB_USERNAME=postgres \
    DB_PASSWORD=postgres \
    STORAGE_TYPE=local \
    LOCAL_STORAGE_PATH=/app/uploads

# Expose the application port
EXPOSE ${PORT}

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]