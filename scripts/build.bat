@echo off

echo Installing dependencies...
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

echo Building the project...
npx vite build

echo Build completed successfully!
