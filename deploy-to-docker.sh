#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Check if Docker is running ---
echo "--- Checking Docker Daemon Status ---"
docker info >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo ""
  echo "ERROR: Docker daemon is not running."
  echo "Please start Docker Desktop or your Docker service and try again."
  echo ""
  exit 1
fi
echo "Docker daemon is running."

# --- NEW: Check if nvm is installed and sourced ---
echo "--- Checking nvm (Node Version Manager) Status ---"
# Check if nvm command exists and is callable
if ! command -v nvm &> /dev/null; then
  echo ""
  echo "WARNING: nvm (Node Version Manager) not found or not sourced."
  echo "Please ensure nvm is installed and correctly loaded in your shell."
  echo "If you manage Node.js globally, you can ignore this warning, but Node/npm must be in PATH."
  echo ""
  # Decide whether to exit or continue with a warning.
  # For this script, we'll issue a warning and assume npm will be found later.
  # If you want to *force* nvm to be present, change 'exit 0' to 'exit 1'.
  # exit 1 # Uncomment this line if nvm is strictly required
fi
echo "nvm check complete."

echo "--- Building Vue.js Frontend ---"
# Navigate to frontend directory, build, then return
(
  cd app/frontend
  npm install # Ensure dependencies are up-to-date
  npm run build
)
echo "Vue.js Frontend build complete."

echo "--- Building Java Backend (and bundling Vue.js) into ROOT.war ---"
# Navigate to Java backend/frontend project, clean and install
(
  cd app/java-backend-frontend
  mvn clean install
)
echo "ROOT.war build complete."

# Define paths
WAR_PATH="app/java-backend-frontend/target/ROOT.war"
TOMCAT_CONTAINER_NAME="my-tomcat-app"
TOMCAT_WEBAPPS_DIR="/usr/local/tomcat/webapps/"

echo "--- Starting Tomcat 10 Container ---"
# Stop and remove any existing container with the same name to ensure a clean start
docker compose down --remove-orphans

# Start the Tomcat container in detached mode
docker compose up -d tomcat

echo "--- Waiting for Tomcat to be ready (briefly) ---"
# Give Tomcat a moment to start up before copying
sleep 10

echo "--- Deploying ROOT.war to Tomcat Container ---"
# Copy the ROOT.war into the webapps directory of the running container
# This will automatically trigger Tomcat to deploy the WAR
docker cp "$WAR_PATH" "$TOMCAT_CONTAINER_NAME:$TOMCAT_WEBAPPS_DIR"

echo "--- Deployment Complete! ---"
echo "Your application should now be accessible at http://localhost:8080/"
echo "Tomcat logs can be viewed with: docker logs -f $TOMCAT_CONTAINER_NAME"
echo "To stop Tomcat: docker compose down"