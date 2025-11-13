Move-Item metro.config.js metro.config.js.bak -ErrorAction SilentlyContinue
eas build --platform android --profile preview
Move-Item metro.config.js.bak metro.config.js -ErrorAction SilentlyContinue
