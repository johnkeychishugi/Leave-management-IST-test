# How to Run the Leave Management System Backend

## Prerequisites
- Java 17 or higher (you already have Java 21 installed)
- Docker and Docker Compose (recommended)
- Alternatively: Maven for direct development

## Option 1: Run with Docker Compose (RECOMMENDED)

This is the easiest method as it will set up the database, backend, and frontend all at once:

```bash
cd /Applications/MAMP/htdocs/leave-management-systm
docker-compose up
```

This will:
- Start a PostgreSQL database
- Build and run the backend
- Build and run the frontend
- Connect all services together with proper network configuration

## Option 2: Install Maven and run with Spring Boot

1. Install Maven:
   ```bash
   # On macOS with Homebrew
   brew install maven
   
   # Alternatively, download from https://maven.apache.org/download.cgi
   # Extract and add to PATH
   ```

2. Run the Spring Boot application:
   ```bash
   cd /Applications/MAMP/htdocs/leave-management-systm/backend
   mvn spring-boot:run
   ```

## Option 3: Run just the backend container

1. Build the Docker image:
   ```bash
   cd /Applications/MAMP/htdocs/leave-management-systm/backend
   docker build -t lms-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:8080 \
     -e DB_URL=jdbc:postgresql://host.docker.internal:5432/lms_db \
     -e DB_USERNAME=postgres \
     -e DB_PASSWORD=postgres \
     lms-backend
   ```

## Known Issues That Need To Be Fixed

The project has several compilation errors that need to be addressed:

1. **Missing OAuth2 classes**:
   - The following classes are missing: `CustomOAuth2UserService` and `OAuth2AuthenticationSuccessHandler`
   - These have been commented out in SecurityConfig temporarily

2. **Model Class Issues**:
   - Many entity classes don't have proper getters/setters or are missing Lombok annotations
   - There are references to methods like `builder()` but some classes might not have the `@Builder` annotation

3. **Path Issues**:
   - There's a mismatch between package/directory structure in imports vs actual files
   - The code references `com.ist.lms.model.LeaveStatus` but it's actually in `com.ist.lms.model.enums`

4. **Package Structure Confusion**:
   - Some code references the `entity` package while other parts use the `model` package

## Next Steps

1. Run the application using Docker Compose
2. If you encounter issues, check the logs to identify specifically which errors need to be fixed
3. Add the missing OAuth2 classes or remove OAuth2 integration if not needed 