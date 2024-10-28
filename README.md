# ChatEz-Backend

Intro to Node.js Express and insomnia: https://www.youtube.com/watch?v=-MTSQjw5DrM

Developer setup:
- Install firebase CLI and login: https://firebase.google.com/docs/cli#mac-linux-auto-script
- Install GCloud CLI and login: https://cloud.google.com/sdk/docs/install
  - Set your account as implicit `gcloud auth application-default login`
  - Set ChatEz project as implicit`gcloud config set project chatez-438923`
- Install nvm (Node Version Manager) guide for ubuntu: https://monovm.com/blog/install-nvm-on-ubuntu/
- Install Node.js on your machine version 20.18.0 (LTS) https://nodejs.org/en/download/package-manager
- Download insomnia for hitting endpoints manually

Running:
- (first time) `npm install`
- Start local server `NODE_ENV=dev nodemon .`
- Stop local server with `Ctrl+C`
- Force stop local server: `sudo kill -9 $(lsof -ti :8080)`

Testing: 
- `npm test`

Notes: 
- Running in "dev" mode disables auth