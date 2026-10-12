@echo off
echo ===================================================
echo     Resume Analyzer - Run
echo ===================================================
echo.
echo Starting the application with the configured database...
echo.
cd /d "%~dp0"
call npm.cmd --prefix frontend ci
if errorlevel 1 (
    echo Failed to install frontend dependencies.
    exit /b 1
)
call npm.cmd --prefix frontend run build
if errorlevel 1 (
    echo Failed to build the React frontend.
    exit /b 1
)
call .\backend\mvnw.cmd -f .\backend\pom.xml spring-boot:run
