#!/bin/bash

echo "========================================"
echo "  Leave Management System Backend Builder"
echo "========================================"
echo "Building the application using Docker..."

# Ensure Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker Desktop first."
  exit 1
fi

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Creating Docker build container...${NC}"
echo "This will build the project using Maven in a Docker container"

# Build the project using Maven in Docker
docker run --rm -v "$(pwd)":/app -w /app maven:3.9-eclipse-temurin-17 mvn clean package -DskipTests

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Build successful!${NC}"
  echo "The JAR file has been created in the target directory."
  echo ""
  echo -e "${YELLOW}You can now run the application using:${NC}"
  echo "java -jar target/leave-management-system-0.0.1-SNAPSHOT.jar"
  echo ""
  echo -e "${YELLOW}Or using Docker Compose:${NC}"
  echo "cd .. && docker-compose up"
else
  echo -e "${RED}Build failed.${NC}"
  echo "Please check the error messages above."
fi 