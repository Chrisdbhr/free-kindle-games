@echo off
cd /d "%~dp0"
echo Starting Kindle Games server at http://localhost:8080
npx serve -s -l 8080
pause