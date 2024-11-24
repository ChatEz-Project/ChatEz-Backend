const MessageConnector = require('../../src/message/MongoConnector');
const User = require('../../src/user/Model');
const Message = require('../../src/message/Model');
const routesTest = require("../../src/App");

const request = require('supertest');
const mongoose = require('mongoose');
const UserConnector = require("../../src/user/MongoConnector");

const api = request(routesTest);

describe('Test /sendMessage/:recipient', () => {
  beforeAll(async () => {
    await MessageConnector.connectToDatabase()
    await UserConnector.connectToDatabase()
    await MessageConnector.testOnlyDeleteAll()
    await UserConnector.testOnlyDeleteAll()
  })

  afterAll(async () => {
    await MessageConnector.testOnlyDeleteAll()
    await UserConnector.testOnlyDeleteAll()
    await mongoose.connection.close()
  });

  test("send messages correctly", async () => {
    const sender = "test1@example.com";
    const recipient = "test2@example.com";

    await UserConnector.insertUser(new User({ email: 'test1@example.com' }));
    await UserConnector.insertUser(new User({ email: 'test2@example.com' }));

    const messageContent = "test message"

    const response1 = await api.post(`/sendMessage/${recipient}`)
      .set({'userEmail': sender}) //simulate auth implicitly setting email
      .send({message: messageContent})

    expect(response1.status).toBe(200);

    const response2 = await api.patch(`/getMessages`) //should be visible to sender
      .set({'userEmail': sender})

    expect(response2.status).toBe(200);

    const messagesWithoutMeta = Object.values(response2.body).map(msg => {
      const {__v, _id, dateSent, ...rest} = msg;
      return rest;
    });

    expect(messagesWithoutMeta).toEqual([
      {
        sender: sender,
        recipient: recipient,
        read: false,
        fileUrl: null,
        message: messageContent
      }
    ]);

    const response3 = await api.patch(`/getMessages`) //should be visible to receiver
      .set({'userEmail': recipient})

    expect(response3.status).toBe(200);
    const messagesWithoutMeta2 = Object.values(response3.body).map(msg => {
      const {__v, _id, dateSent, ...rest} = msg;
      return rest;
    });

    expect(messagesWithoutMeta2).toEqual([
      {
        sender: sender,
        recipient: recipient,
        read: false,
        fileUrl: null,
        message: messageContent
      }
    ]);
  });

  test("should reject invalid recipient", async () => {
    const sender = "test1@example.com";
    const recipient = "test3@example.com"; //not inserted in beforeAll()

    const messageContent = "test message"

    const response = await api.post(`/sendMessage/${recipient}`)
      .set({'userEmail': sender}) //simulate auth implicitly setting email
      .send({message: messageContent})

    expect(response.status).toBe(404);
  });

  test("should deny request without message in body", async () => {
    const sender = "test1@example.com";
    const recipient = "test2@example.com";

    const response = await api.post(`/sendMessage/${recipient}`)
      .set({'userEmail': sender}) //simulate auth implicitly setting email

    expect(response.status).toBe(400);
  });
})

describe('Test /getMessagesForSidebar', () => {
  beforeAll(async () => {
    await MessageConnector.connectToDatabase()
    await MessageConnector.testOnlyDeleteAll()
  })

  afterAll(async () => {
    await MessageConnector.testOnlyDeleteAll()
    await mongoose.connection.close()
  });

  test("should get latest messages for sidebar", async () => {
    await MessageConnector.storeNewMessage(new Message({sender: "bob", recipient: "dave", message:"test1"}));
    await MessageConnector.storeNewMessage(new Message({sender: "dave", recipient: "bob", message:"test2"}));
    await MessageConnector.storeNewMessage(new Message({sender: "dave", recipient: "bob", message:"test3"}));
    await MessageConnector.storeNewMessage(new Message({sender: "dave", recipient: "craig", message:"test4"}));

    const response = await api.patch(`/getMessagesForSidebar`)
      .set({'userEmail': "dave"}) //simulate auth implicitly setting email

    expect(response.status).toBe(200);
    const responseMessages = response.body.map(msg => new Message(msg))
    expect(responseMessages.map(msg => msg.message)).toStrictEqual(["test4", "test3"])
  });
})

describe('Test /getMessagesForFrieFriendnd/:friendEmail', () => {
  beforeAll(async () => {
    await MessageConnector.connectToDatabase()
    await MessageConnector.testOnlyDeleteAll()
  })

  afterAll(async () => {
    await MessageConnector.testOnlyDeleteAll()
    await mongoose.connection.close()
  });

  test("should get messages for friend and set read to true correctly", async () => {
    await MessageConnector.storeNewMessage(new Message({sender: "bob", recipient: "dave", message:"test1"}));
    await MessageConnector.storeNewMessage(new Message({sender: "dave", recipient: "bob", message:"test2"}));
    await MessageConnector.storeNewMessage(new Message({sender: "dave", recipient: "bob", message:"test3"}));
    await MessageConnector.storeNewMessage(new Message({sender: "dave", recipient: "craig", message:"test4"}));

    const response = await api.patch(`/getMessagesForFriend/bob`)
      .set({'userEmail': "dave"}) //simulate auth implicitly setting email

    expect(response.status).toBe(200);
    const responseMessages = response.body.map(msg => new Message(msg))
    expect(responseMessages.map(msg => (msg.message, msg.read))).toStrictEqual([("test3", false), ("test2", false), ("test1", true)]);
  });
})
