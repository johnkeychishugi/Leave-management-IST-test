#!/bin/bash

# Script to fix React dependency issues for Radix UI components

echo "Installing missing dependencies for Radix UI..."

# Install the main dependencies with legacy peer deps
npm install --legacy-peer-deps

# Install critical missing dependencies needed by Radix UI
npm install --save --legacy-peer-deps \
  react-remove-scroll@2.5.5 \
  @radix-ui/react-focus-scope@1.0.4 \
  react-remove-scroll-bar@2.3.4 \
  get-nonce@1.0.1 \
  aria-hidden@1.2.3 \
  tslib@2.6.2

echo "Checking for installed dependencies..."
ls -la node_modules/react-remove-scroll
ls -la node_modules/@radix-ui/react-focus-scope

echo "Dependencies fixed. Try building the project again." 