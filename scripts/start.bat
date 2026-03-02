@echo off

set PORT=5000
set DEPLOY_RUN_PORT=%PORT%

echo Starting HTTP service on port %DEPLOY_RUN_PORT% for deploy...
npx vite preview --port %DEPLOY_RUN_PORT%
