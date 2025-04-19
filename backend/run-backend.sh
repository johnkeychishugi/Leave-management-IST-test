#!/bin/bash

echo "========================================"
echo "  Leave Management System - Run Backend"
echo "========================================"

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
docker_running=false
if docker info > /dev/null 2>&1; then
  docker_running=true
  echo -e "${GREEN}✓ Docker is running${NC}"
else
  echo -e "${RED}✗ Docker is not running${NC}"
fi

# Check if PostgreSQL is running locally
pg_running=false
if nc -z localhost 5432 > /dev/null 2>&1; then
  pg_running=true
  echo -e "${GREEN}✓ PostgreSQL is running on port 5432${NC}"
else
  echo -e "${RED}✗ PostgreSQL is not running on port 5432${NC}"
fi

# Check if Maven is installed
maven_installed=false
if command -v mvn > /dev/null 2>&1; then
  maven_installed=true
  echo -e "${GREEN}✓ Maven is installed${NC}"
else
  echo -e "${RED}✗ Maven is not installed${NC}"
fi

# Check if Java is installed
java_installed=false
if command -v java > /dev/null 2>&1; then
  java_installed=true
  java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
  if [ "$java_version" -ge 17 ]; then
    echo -e "${GREEN}✓ Java $java_version is installed (required: 17+)${NC}"
  else
    echo -e "${RED}✗ Java $java_version is installed but version 17+ is required${NC}"
    java_installed=false
  fi
else
  echo -e "${RED}✗ Java is not installed${NC}"
fi

echo ""
echo -e "${BLUE}Available options to run the backend:${NC}"
echo ""

# Option 1: Docker Compose (best option)
echo -e "${YELLOW}Option 1: Use Docker Compose (recommended)${NC}"
if [ "$docker_running" = true ]; then
  echo -e "${GREEN}Prerequisites met!${NC}"
  echo "Command: cd .. && docker-compose up"
  echo "This will start PostgreSQL, backend and frontend together."
  echo ""
else
  echo -e "${RED}Docker is not running. Start Docker Desktop first.${NC}"
  echo ""
fi

# Option 2: Build and run JAR with Docker
echo -e "${YELLOW}Option 2: Build with Docker and run JAR${NC}"
if [ "$docker_running" = true ] && [ "$java_installed" = true ] && [ "$pg_running" = true ]; then
  echo -e "${GREEN}Prerequisites met!${NC}"
  echo "Commands:"
  echo "1. ./build.sh                # Build using Docker"
  echo "2. java -jar target/leave-management-system-0.0.1-SNAPSHOT.jar"
  echo ""
else
  if [ "$docker_running" = false ]; then
    echo -e "${RED}Docker is not running. Start Docker Desktop first.${NC}"
  fi
  if [ "$java_installed" = false ]; then
    echo -e "${RED}Java 17+ is required to run the JAR.${NC}"
  fi
  if [ "$pg_running" = false ]; then
    echo -e "${RED}PostgreSQL is not running. Start PostgreSQL service first.${NC}"
  fi
  echo ""
fi

# Option 3: Use Maven directly
echo -e "${YELLOW}Option 3: Use Maven directly${NC}"
if [ "$maven_installed" = true ] && [ "$pg_running" = true ]; then
  echo -e "${GREEN}Prerequisites met!${NC}"
  echo "Command: mvn spring-boot:run"
  echo ""
else
  if [ "$maven_installed" = false ]; then
    echo -e "${RED}Maven is not installed. Install Maven first:${NC}"
    echo "brew install maven"
  fi
  if [ "$pg_running" = false ]; then
    echo -e "${RED}PostgreSQL is not running. Start PostgreSQL service first.${NC}"
  fi
  echo ""
fi

echo -e "${BLUE}Which option would you like to use?${NC}"
echo "Enter 1, 2, or 3 (or 'q' to quit): "
read choice

case $choice in
  1)
    echo "Starting with Docker Compose..."
    cd .. && docker-compose up
    ;;
  2)
    echo "Building with Docker and running JAR..."
    ./build.sh && java -jar target/leave-management-system-0.0.1-SNAPSHOT.jar
    ;;
  3)
    echo "Running with Maven..."
    mvn spring-boot:run
    ;;
  q)
    echo "Exiting..."
    exit 0
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac 