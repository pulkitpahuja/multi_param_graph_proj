@echo off
cd backend/
rd /s /q webpage
rd /s /q dist
rd /s /q build
cd ..\frontend\
echo "Running build"
call npm run build
echo "RENAMING"
ren build webpage
move webpage ..\backend\
cd ..\backend\
pyinstaller -F --collect-all dateutil app.spec
xcopy "webpage" "dist\app\webpage" /S /E /H /I
xcopy "configs" "dist\app\configs" /S /E /H /I
xcopy "webpage" "dist\app\_internal\webpage" /S /E /H /I
xcopy "configs" "dist\app\_internal\configs" /S /E /H /I

pause