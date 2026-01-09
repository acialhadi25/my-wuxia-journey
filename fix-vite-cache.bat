@echo off
echo Clearing Vite cache and rebuilding...
echo.

REM Clear Vite cache
if exist "node_modules\.vite" (
    echo Removing node_modules\.vite...
    rmdir /s /q "node_modules\.vite"
)

REM Clear dist folder
if exist "dist" (
    echo Removing dist...
    rmdir /s /q "dist"
)

echo.
echo Cache cleared!
echo.
echo Now restart your dev server:
echo   npm run dev
echo   or
echo   bun run dev
echo.
pause
