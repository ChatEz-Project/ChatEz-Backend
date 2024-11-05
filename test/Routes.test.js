const UserConnector = require('../src/user/Connector');
const User = require('../src/user/Model');
const routes = require('../src/App');

const request = require('supertest');
const mongoose = require('mongoose');

const api = request(routes);

describe("Test /getUser", () => {
  beforeAll(async () => {
    await UserConnector.insertUser(new User({ email: 'test@example.com' }));
  });

  afterAll(async () => {
    await UserConnector.testOnlyDeleteAll()
    await mongoose.connection.close()
  });

  test("should get the user", async () => {
    const response = await api.patch("/getUser")
                              .set({'userEmail': "test@example.com"}) //simulate auth implicitly setting email

    expect(response.status).toBe(200);

    const { __v, _id, ...userWithoutMeta } = response.body; //remove db fields
    expect(userWithoutMeta).toEqual(
      {
      email      : 'test@example.com',
      displayName: 'test@example.com',
      lastActive : response.body.lastActive, //copy from res as not possible to test
      language   : process.env.DEFAULT_LANGUAGE,
      friendList : [],
      photoUrl   : process.env.DEFAULT_PROFILE_IMAGE
      }
    );
  });
});


describe("Test /addFriend", () =>{
  beforeAll(async () => {
    await UserConnector.connectToDatabase()
  })

  afterAll(async () => {
    await UserConnector.testOnlyDeleteAll()
    await mongoose.connection.close()
  });

  test("should make friends", async () => {
    const userEmail = "test1@example.com";
    const friendEmail = "test2@example.com";

    await UserConnector.insertUser(new User({ email: userEmail }));
    await UserConnector.insertUser(new User({ email: friendEmail }));

    const response = await api.patch(`/addFriend/${friendEmail}`)
                              .set({'userEmail': userEmail})

    expect(response.status).toBe(200);
    const newUser = await UserConnector.getUser(userEmail);
    const newFriend = await UserConnector.getUser(friendEmail);
    expect(newUser.friendList).toEqual([friendEmail]);
    expect(newFriend.friendList).toEqual([userEmail]);

    await UserConnector.testOnlyDeleteAll()
  })

  test("should prevent duplicate friends", async () => {
    const userEmail = "test1@example.com";
    const friendEmail = "test2@example.com";

    await UserConnector.insertUser(new User({ email: userEmail }));
    await UserConnector.insertUser(new User({ email: friendEmail }));

    const response = await api.patch(`/addFriend/${friendEmail}`)
      .set({'userEmail': userEmail})
    expect(response.status).toBe(200);

    const response2 = await api.patch(`/addFriend/${friendEmail}`)
      .set({'userEmail': userEmail})
    expect(response2.status).toBe(400);

    const newUser = await UserConnector.getUser(userEmail);
    const newFriend = await UserConnector.getUser(friendEmail);
    expect(newUser.friendList).toEqual([friendEmail]);
    expect(newFriend.friendList).toEqual([userEmail]);

    await UserConnector.testOnlyDeleteAll()
  })

  test("should prevent adding yourself as a friend", async () => {
    const userEmail = "test1@example.com";

    await UserConnector.insertUser(new User({ email: userEmail }));

    const response = await api.patch(`/addFriend/${userEmail}`)
      .set({'userEmail': userEmail})

    expect(response.status).toBe(400);

    const newUser = await UserConnector.getUser(userEmail);

    expect(newUser.friendList).toEqual([]);
  })
});

