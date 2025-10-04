#!/bin/bash

# Setup script for QI Credit project
echo "Setting up QI Credit project..."

# Install dependencies
echo "Installing root dependencies..."
npm install

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing blockchain dependencies..."
cd blockchain
npm install
cd ..

echo "Setting up database..."
cd database
# Initialize database here if needed
cd ..

echo "Setup complete!"
echo "To run the application, use: npm run dev"