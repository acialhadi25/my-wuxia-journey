@echo off
echo Clearing Vite cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite
if exist dist rmdir /s /q dist
echo Cache cleared successfully!
echo.
echo You can now run: npm run dev
pause
