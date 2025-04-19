#!/bin/bash

echo "========================================"
echo "  Leave Management System Backend"
echo "========================================"
echo "Building and running the application..."

# Create target directory if it doesn't exist
mkdir -p target

# Compile the Java classes
echo "Compiling Java classes..."
javac -cp ".:lib/*" -d target/classes $(find src/main/java -name "*.java")

# Run the application with JARs in the lib directory
echo "Starting the application..."
java -cp "target/classes:lib/*" com.ist.lms.LeaveManagementSystemApplication

echo "Application has stopped." 