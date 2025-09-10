REM Service install
nssm install vision-web-face-api %cd%\vision-web-face-api.exe

REM Service environment
nssm set vision-web-face-api AppDirectory %cd%
:: nssm.exe set vision-web-face-api AppParameters --port 8000
nssm set vision-web-face-api AppEnvironmentExtra PORT=9999

REM Service details
nssm set vision-web-face-api DisplayName vision-web-face-api
nssm set vision-web-face-api Description face detection service
nssm set vision-web-face-api Start SERVICE_AUTO_START
nssm set vision-web-face-api ObjectName LocalSystem
nssm set vision-web-face-api Type SERVICE_WIN32_OWN_PROCESS

REM Log files
nssm set vision-web-face-api AppStdout .\output.log
nssm set vision-web-face-api AppStderr .\errors.log

REM Log rotation
nssm set vision-web-face-api AppStdoutCreationDisposition 4
nssm set vision-web-face-api AppStderrCreationDisposition 4
nssm set vision-web-face-api AppRotateFiles 1
nssm set vision-web-face-api AppRotateOnline 0
nssm set vision-web-face-api AppRotateSeconds 86400
nssm set vision-web-face-api AppRotateBytes 1048576

REM Start service
net start vision-web-face-api
