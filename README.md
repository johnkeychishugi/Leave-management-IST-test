# Leave Management System

A comprehensive Leave Management System with a Spring Boot backend and Next.js frontend.

## Architecture

- **Backend**: Spring Boot (Java 17) REST API
- **Frontend**: Next.js with React and Tailwind CSS
- **Database**: PostgreSQL
- **Containerization**: Docker

## Docker Hub Images

The Docker images for this application are available on Docker Hub:

- Backend: `jchishugi/lms-backend`
- Frontend: `jchishugi/lms-frontend`

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed on your system
- Git (optional, for cloning the repository)

### Option 1: Run Using Docker Compose with Pre-built Images

1. Create a `docker-compose.yml` file with the following content:

```yaml
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
      - NEXT_PUBLIC_API_URL=http://localhost:8080
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres-data:
```

2. Run the application:

```bash
docker-compose up -d
```

### Option 2: Clone and Build Locally

1. Clone the repository:

```bash
git clone https://github.com/jchishugi/leave-management-system.git
cd leave-management-system
```

2. Start the application using Docker Compose:

```bash
docker-compose up -d
```

## Testing the Application

1. Once all containers are running, you can access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Documentation (Swagger): http://localhost:8080/swagger-ui.html

2. The default admin credentials are:
   - Username: admin@example.com
   - Password: admin123

3. To verify all services are running properly:

```bash
docker ps
```

You should see three containers running: postgres, backend, and frontend.

## Development Setup

### Backend Development

1. The backend is a Spring Boot application using Maven
2. Main dependencies include:
   - Spring Web
   - Spring Data JPA
   - Spring Security
   - JWT Authentication
   - PostgreSQL
   - AWS S3 for document storage (optional)

### Frontend Development

1. The frontend is a Next.js application
2. Main dependencies include:
   - React
   - Tailwind CSS
   - Axios for API calls
   - React Query for data fetching
   - Next Auth for authentication

## Troubleshooting

- **Database Connection Issues**: Check if PostgreSQL container is running and healthy
- **Backend Not Starting**: Check backend logs with `docker logs lms-backend`
- **Frontend Not Loading**: Check frontend logs with `docker logs lms-frontend` 