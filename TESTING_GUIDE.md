# Testing Guide: Leave Management System

This guide provides step-by-step instructions for testing the Leave Management System after deploying Docker images from Docker Hub.

## Prerequisites

- Docker and Docker Compose installed
- Internet connection to pull images from Docker Hub

## Setup for Testing

1. Create a new directory for testing:

```bash
mkdir lms-test
cd lms-test
```

2. Create a `docker-compose.yml` file:

```bash
cat > docker-compose.yml << 'EOF'
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    container_name: lms-db
    environment:
      POSTGRES_DB: lms
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: yourusername/lms-backend:latest
    container_name: lms-backend
    ports:
      - "8080:8080"
    environment:
      - DB_URL=jdbc:postgresql://postgres:5432/lms
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - STORAGE_TYPE=local
      - LOCAL_STORAGE_PATH=/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    image: yourusername/lms-frontend:latest
    container_name: lms-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8080
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres-data:
EOF
```

3. Replace `yourusername` in the file with your actual Docker Hub username:

```bash
# Replace with your Docker Hub username
sed -i '' 's/yourusername/YOUR_ACTUAL_USERNAME/g' docker-compose.yml
```

## Starting the Application

1. Start all services:

```bash
docker-compose up -d
```

2. Check if all containers are running:

```bash
docker-compose ps
```

You should see all three services (postgres, backend, frontend) in the "Up" state.

3. Check container logs for any errors:

```bash
# Check backend logs
docker logs lms-backend

# Check frontend logs
docker logs lms-frontend
```

## Testing the Frontend

1. Open a web browser and navigate to:
   http://localhost:3000

2. You should see the login page of the Leave Management System.

3. Test the login functionality with the default admin credentials:
   - Username: admin@example.com
   - Password: admin123

4. After logging in, verify that you can:
   - View the dashboard
   - Navigate to different sections
   - See the leave calendar
   - Access the profile section

## Testing the Backend API

1. Open a web browser and navigate to the Swagger UI:
   http://localhost:8080/swagger-ui.html

2. Explore the available API endpoints:
   - Authentication endpoints
   - Leave management endpoints
   - User management endpoints

3. Test API functionality using Swagger UI:
   - Try to authenticate
   - Retrieve user information
   - Submit a leave request

## End-to-End Testing Scenarios

### Scenario 1: User Registration and Login

1. Register a new user if the function is available
2. Login with the newly created user
3. Verify that the user can access their dashboard

### Scenario 2: Leave Application Process

1. Login as an employee
2. Navigate to the leave application section
3. Submit a new leave request
4. Verify the leave appears in the pending requests

### Scenario 3: Manager Approval Flow

1. Login as a manager
2. Navigate to the leave approval section
3. Approve or reject a pending leave request
4. Verify the status change is reflected correctly

## Performance Testing

1. Check application load time:
   - Frontend initial load time
   - Dashboard rendering time
   - API response times

2. Check database connectivity:
   - View logs for any database connection issues
   - Verify data persistence by creating records and restarting containers

## Cleanup

When you're done testing, you can stop and remove all containers:

```bash
# Stop containers
docker-compose down

# Remove volumes (only if you want to clear all data)
docker-compose down -v
```

## Troubleshooting Common Issues

### Frontend Can't Connect to Backend

1. Verify the backend container is running
2. Check if the `NEXT_PUBLIC_API_URL` environment variable is set correctly
3. Verify the backend is accessible at http://localhost:8080

### Backend Can't Connect to Database

1. Verify the PostgreSQL container is running
2. Check if the database credentials in the environment variables are correct
3. Check backend logs for connection errors

### Images Not Found

1. Verify you're using the correct Docker Hub username in the docker-compose.yml
2. Check if the images exist on Docker Hub
3. Try manually pulling the images:
   ```bash
   docker pull yourusername/lms-backend:latest
   docker pull yourusername/lms-frontend:latest
   ``` 