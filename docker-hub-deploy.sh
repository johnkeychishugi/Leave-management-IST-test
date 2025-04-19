#!/bin/bash

# Docker Hub deployment script for Leave Management System
# This script builds and pushes Docker images to Docker Hub

# Exit on error
set -e

# Configuration
DOCKER_USERNAME=""
VERSION="1.0.0"
BACKEND_NAME="lms-backend"
FRONTEND_NAME="lms-frontend"

# Print banner
echo "====================================================="
echo "  Leave Management System - Docker Hub Deployment"
echo "====================================================="
echo "This script will build and push your Docker images to Docker Hub."

# Prompt for Docker Hub username if not provided
if [ -z "$DOCKER_USERNAME" ]; then
  echo "Enter your Docker Hub username:"
  read DOCKER_USERNAME
fi

# Check if logged in to Docker Hub
echo "Checking Docker Hub login status..."
docker info > /dev/null 2>&1 || { echo "Docker is not running. Please start Docker and try again."; exit 1; }

# Login to Docker Hub if needed
docker_login_status=$(docker system info --format '{{.RegistryConfig.IndexConfigs}}' | grep -c "$DOCKER_USERNAME" || true)
if [ "$docker_login_status" -eq 0 ]; then
  echo "Logging in to Docker Hub..."
  docker login
else
  echo "Already logged in to Docker Hub."
fi

# Check for required files
echo "Verifying project structure..."

# Make sure the Next.js config exists
if [ ! -f "frontend/next.config.js" ]; then
  echo "Creating next.config.js file to handle dependency issues..."
  cat > frontend/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [],
    serverActions: false,
  },
  transpilePackages: [
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-use-callback-ref',
    '@radix-ui/react-use-controllable-state',
    '@radix-ui/react-use-effect-event',
    'lucide-react',
    'react-day-picker',
  ],
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@radix-ui/react-use-effect-event': require.resolve('./shims/use-effect-event-shim.js'),
      };
    }
    
    return config;
  },
  output: 'standalone',
};

module.exports = nextConfig;
EOF
  echo "Created next.config.js file."
fi

# Create shims directory if it doesn't exist
if [ ! -d "frontend/shims" ]; then
  echo "Creating shims directory..."
  mkdir -p frontend/shims
fi

# Create the useEffectEvent shim file
if [ ! -f "frontend/shims/use-effect-event-shim.js" ]; then
  echo "Creating React shim file for useEffectEvent..."
  cat > frontend/shims/use-effect-event-shim.js << 'EOF'
'use strict';

// This is a shim for the useEffectEvent function that doesn't exist in React 18.2.0
Object.defineProperty(exports, '__esModule', { value: true });

const React = require('react');

// Shim for useEffectEvent using useCallback as fallback
function useEffectEvent(callback) {
  const callbackRef = React.useRef(callback);
  
  // Update the ref whenever the callback changes
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Return a stable function identity that calls the latest callback
  return React.useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
}

exports.useEffectEvent = useEffectEvent;
EOF
  echo "Created React shim file."
fi

# Create dockerignore files if they don't exist
if [ ! -f "frontend/.dockerignore" ]; then
  echo "Creating frontend/.dockerignore file..."
  cat > frontend/.dockerignore << 'EOF'
# Dependencies
node_modules
npm-debug.log
yarn-error.log
yarn-debug.log
.pnpm-debug.log

# Next.js build output
.next
out

# Environment variables
.env*.local

# IDE files
.idea
.vscode
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Test and coverage
coverage
.nyc_output
test-results

# Debug logs
logs
*.log

# Git related
.git
.github
.gitignore

# Build files
build
dist
EOF
  echo "Created frontend/.dockerignore file."
fi

if [ ! -f "backend/.dockerignore" ]; then
  echo "Creating backend/.dockerignore file..."
  cat > backend/.dockerignore << 'EOF'
# Maven build directory
target/

# IDE files
.idea/
.vscode/
*.iml
*.iws
*.ipr
.classpath
.project
.settings/

# Logs
logs/
*.log

# Git
.git/
.github/
.gitignore

# OS specific files
.DS_Store
Thumbs.db

# Environment files
.env*
*.env

# Application specific
uploads/

# Test files
**/test/
**/tests/
EOF
  echo "Created backend/.dockerignore file."
fi

# Build and push backend image
echo "Building backend image..."
docker build -t $BACKEND_NAME ./backend

echo "Tagging backend image..."
docker tag $BACKEND_NAME $DOCKER_USERNAME/$BACKEND_NAME:latest
docker tag $BACKEND_NAME $DOCKER_USERNAME/$BACKEND_NAME:$VERSION

echo "Pushing backend images to Docker Hub..."
docker push $DOCKER_USERNAME/$BACKEND_NAME:latest
docker push $DOCKER_USERNAME/$BACKEND_NAME:$VERSION

# Build and push frontend image
echo "Building frontend image..."
docker build -t $FRONTEND_NAME ./frontend

echo "Tagging frontend image..."
docker tag $FRONTEND_NAME $DOCKER_USERNAME/$FRONTEND_NAME:latest
docker tag $FRONTEND_NAME $DOCKER_USERNAME/$FRONTEND_NAME:$VERSION

echo "Pushing frontend images to Docker Hub..."
docker push $DOCKER_USERNAME/$FRONTEND_NAME:latest
docker push $DOCKER_USERNAME/$FRONTEND_NAME:$VERSION

echo "Deployment complete!"
echo "Your images are now available on Docker Hub:"
echo "- $DOCKER_USERNAME/$BACKEND_NAME:latest"
echo "- $DOCKER_USERNAME/$BACKEND_NAME:$VERSION"
echo "- $DOCKER_USERNAME/$FRONTEND_NAME:latest"
echo "- $DOCKER_USERNAME/$FRONTEND_NAME:$VERSION"

echo ""
echo "To use these images, update your docker-compose.yml file with:"
echo "backend: image: $DOCKER_USERNAME/$BACKEND_NAME:latest"
echo "frontend: image: $DOCKER_USERNAME/$FRONTEND_NAME:latest" 