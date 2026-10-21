@echo off
rem Double-click to run World Woodshed on this computer. Close this window to stop it.
title World Woodshed
cd /d "%~dp0world-woodshed"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  World Woodshed needs Node.js ^(free^). Opening the download page...
  echo  Install the LTS version, then double-click this file again.
  echo.
  start "" "https://nodejs.org/en/download"
  pause
  exit /b 1
)

rem Install on first run, and again whenever the dependency list changes
set NEEDS_INSTALL=0
if not exist "node_modules\.ww-lock" set NEEDS_INSTALL=1
if exist "node_modules\.ww-lock" fc /b package-lock.json "node_modules\.ww-lock" >nul 2>nul || set NEEDS_INSTALL=1
if "%NEEDS_INSTALL%"=="1" (
  echo.
  echo  Setting things up. This takes a minute and needs internet once.
  echo.
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo  Setup failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
  copy /y package-lock.json "node_modules\.ww-lock" >nul
)

echo.
echo  Starting World Woodshed. Your browser will open in a moment.
echo  Keep this window open while you practise; close it to stop.
echo.
call npm run dev -- --open
pause
