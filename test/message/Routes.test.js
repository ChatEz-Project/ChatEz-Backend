const MessageConnector = require('../../src/message/MongoConnector');
const User = require('../../src/user/Model');
const routesTest = require("../../src/App");

const request = require('supertest');
const mongoose = require('mongoose');
const UserConnector = require("../../src/user/Connector");

const api = request(routesTest);

describe('Test /sendMessage/:recipient', () => {
  beforeAll(async () => {
    await MessageConnector.connectToDatabase()
    await UserConnector.connectToDatabase()
    await MessageConnector.testOnlyDeleteAll()
    await UserConnector.testOnlyDeleteAll()
    await UserConnector.insertUser(new User({ email: 'test1@example.com' }));
    await UserConnector.insertUser(new User({ email: 'test2@example.com' }));
  })

  afterAll(async () => {
    await MessageConnector.testOnlyDeleteAll()
    await UserConnector.testOnlyDeleteAll()
    await mongoose.connection.close()
  });

  test("send messages correctly", async () => {
    const sender = "test1@example.com";
    const recipient = "test2@example.com";

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
