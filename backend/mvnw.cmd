@echo off
setlocal

set "WRAPPER_DIR=%~dp0"
set "LOCAL_MAVEN=%WRAPPER_DIR%..\.maven\apache-maven-3.9.6\bin\mvn.cmd"

if exist "%LOCAL_MAVEN%" (
  call "%LOCAL_MAVEN%" %*
  exit /b %ERRORLEVEL%
)

echo Local Maven distribution not found at "%LOCAL_MAVEN%".
echo Falling back to mvn on PATH.
mvn %*