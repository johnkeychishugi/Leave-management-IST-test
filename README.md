# Testing Guide: Leave Management System

This guide provides step-by-step instructions for testing the Leave Management System.

## Architecture

- **Backend**: Spring Boot (Java 17) REST API
- **Frontend**: Next.js with React and Tailwind CSS
- **Database**: PostgreSQL
- **Containerization**: Docker

## Docker Hub Images

The Docker images for this application are available on Docker Hub:

- Backend: https://hub.docker.com/repository/docker/jchishugi/lms-backend
- Frontend: https://hub.docker.com/repository/docker/jchishugi/lms-frontend

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
      - "5433:5432" 
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: jchishugi/lms-backend:latest
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
    image: jchishugi/lms-frontend:latest
    container_name: lms-frontend
    ports:
      - "3000:3000"
    environment:
       - NODE_ENV=development
       - NEXT_PUBLIC_API_URL=http://localhost:8080/api
       - NEXT_PUBLIC_ALLOWED_DOMAINS=ist.com
       - NEXT_PUBLIC_AZURE_CLIENT_ID=a182ac8e-b6fb-4775-b902-03cd5ca2defb
       - NEXT_PUBLIC_AZURE_AUTHORITY=https://login.microsoftonline.com/consumers
       - NEXT_PUBLIC_AZURE_REDIRECT_URI=http://localhost:3000/login
       - NEXT_PUBLIC_AZURE_POST_LOGOUT_REDIRECT_URI=http://localhost:3000/login
       - NEXT_PUBLIC_AZURE_SCOPES=openid profile email User.Read
       - NEXT_PUBLIC_AZURE_GRAPH_ENDPOINT=https://graph.microsoft.com/v1.0
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres-data:
EOF
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

3. Test the login functionality with the default:
  ### Admin credentials:
     - Username: admin@ist.com
     - Password: admin123

  ### Manager credentials:
     - Username: manager@ist.com
     - Password: manager123

  ### Employee credentials:
     - Username: employee@ist.com
     - Password: employee123
  

4. After logging in, verify that you can:
   - View the dashboard
   - Navigate to different sections
   - See the leave calendar
   - Create leave balance((Admin/Manager))
   - Manager users (Admin/Manager)
   - Apply for a leave
   - Create Leave type, department (Admin)
   - Access the profile section
   - Etc

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

1. Login as a manager or an admin
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