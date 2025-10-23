#!/bin/bash

# Go into the frontend folder
cd frontend

# Install dependencies
npm install

# Build React frontend
npm run build

# Start Express server (make sure your server serves the React build)
node server/server.js
