@echo off
echo ===================================================
echo     Resume Analyzer - Run
echo ===================================================
echo.
echo Starting the application with the configured database...
echo.
cd /d "%~dp0"
call .\backend\mvnw.cmd -f .\backend\pom.xml spring-boot:run
