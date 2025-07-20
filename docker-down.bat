@echo off
echo Stopping Docker containers...
docker compose down
if %errorlevel% equ 0 (
echo Docker containers stopped successfully.
) else (
echo Failed to stop Docker containers.
exit /b %errorlevel%
)
