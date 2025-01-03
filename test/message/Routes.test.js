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
    jest.setTimeout(30000)
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
    expect(responseMessages.map(msg => msg.message)).toStrictEqual(["test3", "test4"])
  });
})

describe('Test /getMessagesForFriend/:friendEmail', () => {
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
    expect(responseMessages.map(msg => (msg.message, msg.read))).toStrictEqual([("test1", true), ("test2", false), ("test3", false)]);
  });
})

describe('Test /deleteAllUserConversations', () => {
  beforeAll(async () => {
    await MessageConnector.connectToDatabase()
    await MessageConnector.testOnlyDeleteAll()
  })

  afterAll(async () => {
    await MessageConnector.testOnlyDeleteAll()
    await mongoose.connection.close()
  });

  test("should delete conversations correctly", async () => {
    await MessageConnector.storeNewMessage(new Message({sender: "bob", recipient: "dave", message:"test1"}));
    await MessageConnector.storeNewMessage(new Message({sender: "dave", recipient: "bob", message:"test2"}));
    await MessageConnector.storeNewMessage(new Message({sender: "dave", recipient: "bob", message:"test3"}));
    await MessageConnector.storeNewMessage(new Message({sender: "bob", recipient: "craig", message:"test4"}));

    const response = await api.delete(`/deleteAllUserConversations`)
      .set({'userEmail': "dave"}) //simulate auth implicitly setting email

    expect(response.status).toBe(200);

    const response2 = await api.patch(`/getMessages`)
      .set({'userEmail': "dave"}) //simulate auth implicitly setting email

    const responseMessages = response2.body.map(msg => new Message(msg))
    expect(responseMessages.map(msg => msg.message)).toStrictEqual([]);

    const response3 = await api.patch(`/getMessages`)
      .set({'userEmail': "bob"}) //simulate auth implicitly setting email

    const responseMessages2 = response3.body.map(msg => new Message(msg))
    expect(responseMessages2.map(msg => msg.message)).toStrictEqual(["test4"]);
  });
})

describe("Test /deleteConversation/:friendEmail", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    await MessageConnector.connectToDatabase();
    await UserConnector.connectToDatabase();
    await MessageConnector.testOnlyDeleteAll();
    await UserConnector.testOnlyDeleteAll();
  });

  afterAll(async () => {
    await MessageConnector.testOnlyDeleteAll();
    await UserConnector.testOnlyDeleteAll();
    await mongoose.connection.close();
  });
  
  test("should delete all messages between client and friend", async () => {
    const clientEmail = "test1@example.com";
    const friendEmail = "test2@example.com";

    // Insert users
    await UserConnector.insertUser(new User({ email: clientEmail }));
    await UserConnector.insertUser(new User({ email: friendEmail }));

    // Insert messages between client and friend
    await MessageConnector.storeNewMessage(new Message({sender: clientEmail, recipient: friendEmail, message: "test1"}));
    await MessageConnector.storeNewMessage(new Message({ sender: friendEmail, recipient: clientEmail, message: "test2"}));
    await MessageConnector.storeNewMessage(new Message({sender: clientEmail, recipient: friendEmail, message: "test3"}));

    // Verify messages exist before deletion
    const preDeleteMessages = await MessageConnector.getFriendMessages(clientEmail, friendEmail);
    expect(preDeleteMessages.length).toBe(3);

    // Delete conversation
    const response = await api.post(`/deleteConversation/${friendEmail}`)
      .set({ userEmail: clientEmail });

    expect(response.status).toBe(200);
    expect(response.text).toBe(`Conversation deleted for friend ${friendEmail}`);

    // Verify messages have been deleted
    const postDeleteMessages = await MessageConnector.getFriendMessages(clientEmail, friendEmail);
    expect(postDeleteMessages.length).toBe(0);
  });
});