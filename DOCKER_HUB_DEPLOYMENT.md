# Docker Hub Deployment Guide

This guide provides step-by-step instructions for building, tagging, and pushing your Docker images to Docker Hub.

## Step 1: Create a Docker Hub Account

1. Go to [Docker Hub](https://hub.docker.com/) and sign up for an account if you don't have one
2. Verify your email address

## Step 2: Login to Docker Hub from CLI

Open your terminal and log in to Docker Hub:

```bash
docker login
```

Enter your Docker Hub username and password when prompted.

## Step 3: Fix Known Build Issues

Before building the images, we need to address a few dependency issues:

### Frontend Build Fixes

1. Ensure the frontend has the right configuration:

```bash
# Check that next.config.js exists
ls -la frontend/next.config.js

# If it doesn't exist, use the deployment script to create it
./docker-hub-deploy.sh
```

2. The deployment script will automatically:
   - Create the necessary `next.config.js` file with the right transpile settings
   - Configure webpack to handle case sensitivity issues
   - Update the build process to resolve dependency conflicts

## Step 4: Build and Tag the Docker Images

Navigate to your project directory:

```bash
cd /path/to/leave-management-systm
```

### Build and Tag Backend Image

```bash
# Build the backend image
docker build -t lms-backend ./backend

# Tag the image with your Docker Hub username
docker tag lms-backend jchishugi/lms-backend:latest

# You can also tag with a specific version
docker tag lms-backend jchishugi/lms-backend:1.0.0
```

### Build and Tag Frontend Image

```bash
# Build the frontend image
docker build -t lms-frontend ./frontend

# Tag the image with your Docker Hub username
docker tag lms-frontend jchishugi/lms-frontend:latest

# You can also tag with a specific version
docker tag lms-frontend jchishugi/lms-frontend:1.0.0
```

## Step 5: Push Images to Docker Hub

Now push your tagged images to Docker Hub:

```bash
# Push backend image
docker push jchishugi/lms-backend:latest
docker push jchishugi/lms-backend:1.0.0

# Push frontend image
docker push jchishugi/lms-frontend:latest
docker push jchishugi/lms-frontend:1.0.0
```

## Step 6: Verify Your Images on Docker Hub

1. Go to [Docker Hub](https://hub.docker.com/)
2. Sign in to your account
3. Navigate to "Repositories"
4. You should see your newly pushed images:
   - `jchishugi/lms-backend`
   - `jchishugi/lms-frontend`

## Step 7: Using Your Docker Hub Images

To use your images from Docker Hub, update your `docker-compose.yml` file to use the published images:

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
    image: jchishugi/lms-backend:latest
    container_name: lms-backend
    ports:
      - "8080:8080"
    environment:
      - DB_URL=jdbc:postgresql://postgres:5433/lms
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
```

Then run:

```bash
docker-compose up -d
```

## Troubleshooting Build Issues

### Frontend Build Failures

If you encounter build failures with the frontend:

1. Check React component dependencies:
   ```bash
   # Make sure all required dependencies are installed
   cd frontend
   npm install @radix-ui/react-dropdown-menu@latest @radix-ui/react-popover@latest react-day-picker@latest lucide-react@latest
   ```

2. Check for case sensitivity issues:
   - The project has issues with component imports using different cases (e.g., `Button.tsx` vs `button.tsx`)
   - Our `next.config.js` configuration helps resolve this

3. Run the provided script:
   ```bash
   ./docker-hub-deploy.sh
   ```
   This script will handle all necessary fixes automatically.

### Backend Build Failures

If you encounter build failures with the backend:

1. Ensure all Java dependencies are correctly specified in `pom.xml`
2. Check database configuration in `application.properties` or environment variables

## Security Best Practices

1. **Use Specific Tags**: Avoid using `latest` in production; use specific version tags
2. **Scan Images**: Use Docker's vulnerability scanning features
3. **Minimize Image Size**: Use multi-stage builds to keep images small
4. **Use Private Repositories**: For sensitive applications, use private Docker Hub repositories
5. **Rotate Credentials**: Regularly update your Docker Hub access tokens 