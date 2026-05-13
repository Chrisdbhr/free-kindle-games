@echo off
cd /d "%~dp0"
echo Starting Kindle Games server at http://localhost:8080
start http://localhost:8080
python -m http.server 8080 2>nul || npx --yes serve -s -l 8080
pause