:: e2e_example/deploy-to-docker.bat
@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

:: Jump past function definitions to the main script logic
GOTO :main_script_start

:: --- Functions for error handling ---
:: Check if the last command was successful
:check_error
IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO ERROR: A command failed. Exiting.
    ECHO.
    EXIT /B %ERRORLEVEL%
)
GOTO :EOF

:: --- Main Script Start ---
:main_script_start

ECHO Script started!

:: --- Check if Docker is running ---
ECHO --- Checking Docker Daemon Status ---
docker info >NUL 2>&1
CALL :check_error
ECHO Docker daemon is running.

ECHO --- Building Vue.js Frontend ---
pushd app\frontend
CALL npm install
CALL :check_error
CALL npm run build
CALL :check_error
popd
ECHO Vue.js Frontend build complete.

ECHO --- Building Java Backend (and bundling Vue.js) into ROOT.war ---
pushd app\java-backend-frontend
CALL mvn clean install
CALL :check_error
popd
ECHO ROOT.war build complete.

:: Define paths
SET "WAR_PATH=app\java-backend-frontend\target\ROOT.war"
SET "TOMCAT_CONTAINER_NAME=my-tomcat-app"
SET "TOMCAT_WEBAPPS_DIR=/usr/local/tomcat/webapps/"

ECHO --- Starting Tomcat 10 Container ---
:: Stop and remove any existing container with the same name to ensure a clean start
docker compose down --remove-orphans
CALL :check_error

:: Start the Tomcat container in detached mode
docker compose up -d tomcat
CALL :check_error

ECHO --- Waiting for Tomcat to be ready (briefly) ---
:: Give Tomcat a moment to start up before copying
timeout /t 10 /nobreak >NUL
CALL :check_error

ECHO --- Deploying ROOT.war to Tomcat Container ---
:: Copy the ROOT.war into the webapps directory of the running container
:: This will automatically trigger Tomcat to deploy the WAR
docker cp "%WAR_PATH%" "%TOMCAT_CONTAINER_NAME%:%TOMCAT_WEBAPPS_DIR%"
CALL :check_error

ECHO --- Deployment Complete! ---
ECHO Your application should now be accessible at http://localhost:8080/
ECHO Tomcat logs can be viewed with: docker logs -f %TOMCAT_CONTAINER_NAME%
ECHO To stop Tomcat: docker compose down

ENDLOCAL