# ChatEz-Backend

Intro to Node.js Express and insomnia: https://www.youtube.com/watch?v=-MTSQjw5DrM

Developer setup:
- Install nvm (Node Version Manager) guide for ubuntu: https://monovm.com/blog/install-nvm-on-ubuntu/
- Install Node.js on your machine version 20.18.0 (LTS) https://nodejs.org/en/download/package-manager
- Download insomnia for hitting endpoints manually

Running:
- (first time) `npm install`
- Start local server `nodemon node .`
- Stop local server with `Ctrl+C`
- Force stop local server: `sudo kill -9 $(lsof -ti :8080)`

Testing: 
- `npm test`