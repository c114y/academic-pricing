@echo off

echo Installing dependencies...
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only
