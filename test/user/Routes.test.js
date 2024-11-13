const UserConnector = require('../../src/user/MongoConnector');
const User = require('../../src/user/Model');
const routes = require('../../src/App');

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
    const response = await api.patch("/getUser/test@example.com")

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

describe("Test /removeFriend/:friendEmail", () =>{
  beforeAll(async () => {
    await UserConnector.connectToDatabase()
  })

  afterAll(async () => {
    await UserConnector.testOnlyDeleteAll()
    await mongoose.connection.close()
  });

  test("should remove friends correctly", async () => {
    const user1 = "test1@example.com";
    const user2 = "test2@example.com";
    const user3 = "test3@example.com";

    await UserConnector.insertUser(new User({ email: user1, friendList:["test2@example.com", "test3@example.com"] }));
    await UserConnector.insertUser(new User({ email: user2, friendList:["test1@example.com"] }));
    await UserConnector.insertUser(new User({ email: user3, friendList:["test1@example.com"] }));

    response1 = await api.patch(`/removeFriend/${user2}`)
             .set({'userEmail': user1})
    expect(response1.status).toBe(200); //accepts valid request

    const response2 = await UserConnector.getUser(user1)
    expect(response2.friendList).toStrictEqual([user3]); //no longer friends with 2

    const response3 = await UserConnector.getUser(user2)
    expect(response3.friendList).toStrictEqual([]); //no longer friends with 1

    response4 = await api.patch(`/removeFriend/${user2}`)
      .set({'userEmail': user1})
    expect(response4.status).toBe(400); //cannot unfriend some you already aren't friends with

    response5 = await api.patch(`/removeFriend/${user1}`)
      .set({'userEmail': user1})
    expect(response5.status).toBe(400); //cannot unfriend self

    response6 = await api.patch(`/removeFriend/notARealUser@example.com}`)
      .set({'userEmail': user1})
    expect(response6.status).toBe(400); //cannot unfriend a non existent user

    await UserConnector.testOnlyDeleteAll()
  })
});

describe("Test /getFriends", () => {
  beforeAll(async () => {
    await UserConnector.connectToDatabase()
  })
  afterAll(async () => {
    await UserConnector.testOnlyDeleteAll()
    await mongoose.connection.close()
  });

  test("should return correct friends", async () => {
    const user1 = "56rolsj@gmail.com";
    const user2 = "test2@example.com";
    const user3 = "test3@example.com";
    const user4 = "test4@example.com";

    await UserConnector.insertUser(new User({ email: user1, friendList: [user2, user3] }));
    await UserConnector.insertUser(new User({ email: user2, friendList: [user1] }));
    await UserConnector.insertUser(new User({ email: user3, friendList: [user1] }));
    await UserConnector.insertUser(new User({ email: user4 }));

    result1 = await api.patch(`/getFriends`)
      .set({'userEmail': user1});
    expect(result1.status).toBe(200);
    expect(result1.body.map(user => user.email)).toStrictEqual([user2, user3]);

    result2 = await api.patch(`/getFriends`)
      .set({'userEmail': user2});
    expect(result2.status).toBe(200);
    expect(result2.body.map(user => user.email)).toStrictEqual([user1]);

    result3 = await api.patch(`/getFriends`)
      .set({'userEmail': user4});
    expect(result3.status).toBe(200);
    expect(result3.body.map(user => user.email)).toStrictEqual([]);
  });
})
