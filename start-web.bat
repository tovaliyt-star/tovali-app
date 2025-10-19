@echo off
echo ================================
echo   TOVALI Marketplace - Web
echo ================================
echo.
echo Cleaning cache and starting fresh...
call npm cache clean --force
echo.
echo Starting web development server...
echo The app will open automatically in your browser.
echo If not, go to: http://localhost:19006
echo.
call npm run web
echo.
echo Press any key to close...
pause >nul


