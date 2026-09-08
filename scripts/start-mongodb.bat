@echo off
setlocal EnableDelayedExpansion

docker info >nul 2>&1
if errorlevel 1 (
  echo Docker is not installed or Docker Desktop is not running.
  echo Install Docker Desktop from https://www.docker.com/products/docker-desktop/
  exit /b 1
)

docker compose up -d mongo-admin mongo-participant
if errorlevel 1 exit /b 1

echo Waiting for MongoDB containers to become healthy...
for /l %%n in (1,1,30) do (
  set "ADMIN_STATUS="
  set "PARTICIPANT_STATUS="
  for /f "delims=" %%s in ('docker inspect --format "{{.State.Health.Status}}" mongo-admin 2^>nul') do set "ADMIN_STATUS=%%s"
  for /f "delims=" %%s in ('docker inspect --format "{{.State.Health.Status}}" mongo-participant 2^>nul') do set "PARTICIPANT_STATUS=%%s"
  if "!ADMIN_STATUS!"=="healthy" if "!PARTICIPANT_STATUS!"=="healthy" goto healthy
  timeout /t 2 /nobreak >nul
)

echo MongoDB containers did not become healthy. Check: docker compose logs
exit /b 1

:healthy
echo MongoDB is ready.
echo Admin: mongodb://localhost:27017/csea_admin
echo Participant: mongodb://localhost:27018/csea_participant
echo Stop with: docker compose down
endlocal
