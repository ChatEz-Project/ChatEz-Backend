# ChatEz-Backend

#### Intro to Node.js Express and insomnia: https://www.youtube.com/watch?v=-MTSQjw5DrM

#### Developer setup:
- Install GCloud CLI: https://cloud.google.com/sdk/docs/install
  - Set default auth `gcloud auth application-default login`
- Install nvm (Node Version Manager) guide for ubuntu: https://monovm.com/blog/install-nvm-on-ubuntu/
- Install Node.js on your machine version 20.18.0 (LTS) https://nodejs.org/en/download/package-manager
- Download insomnia for hitting endpoints manually

#### Running:
- (first time) `npm install`
- Start local server `NODE_ENV=dev nodemon .`
- Stop local server with `Ctrl+C`
- Force stop local server: `sudo kill -9 $(lsof -ti :8080)`

#### Testing: 
- `NODE_ENV=test npm test -- --maxWorkers=1`
  - can only have 1 worker as accessing db and cannot do asynchronous changes

#### Notes: 
- Running in "dev" 
  - uses development database
  - if you want your own database change `MONGO_DB=ChatEz-Development` in .env.dev to a name of your choice
- Running in "test" 
  - uses test database (for destructive testing)
  - disables auth and lastActive middleware, needed when doing npm test

#### Features:

- [x] getUser
- [ ] setLanguage
- [ ] setDisplayName
- [x] setProfilePhoto


- [x] addFriend
- [x] removeFriend
- [x] friendList


- [x] sendMessage
- [x] getMessages
- [x] getMessagesForSideBar
- [x] getUserMessages
- [x] setMessagesReadImplicitly


- [ ] deleteConversation
- [ ] deleteAllMessages
- [ ] deleteUser


- [x] implicitLastActive
