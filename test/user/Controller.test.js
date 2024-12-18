const UserConnector = require('../../src/user/MongoConnector');
const UserController = require('../../src/user/Controller');
const User = require('../../src/user/Model');

const mongoose = require('mongoose');

describe("Test UserController", () => {
  describe("Test updateLastActive", () => {
    beforeAll(async () => {
      jest.setTimeout(30000)
      await UserConnector.connectToDatabase()
    })

    afterAll(async () => {
      await UserConnector.testOnlyDeleteAll()
      await mongoose.connection.close()
    });

    test("update new user", async () => {
      const email = "test1@example.com";

      const req = {userEmail: email}
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await UserController.updateLastActive(req, res, next)

      lookupUser = await UserConnector.getUser(email);
      expect(lookupUser.email).toEqual(email); //should be a new user entry in db
    });

    test("update existing user", async () => {
      const email = "test2@example.com";
      const user = new User({email: email});

      await UserConnector.insertUser(user)

      const req = {userEmail: email}
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await UserController.updateLastActive(req, res, next)

      lookupUser = await UserConnector.getUser(email);
      expect(lookupUser.lastActive.getTime()).toBeGreaterThan(user.lastActive.getTime()); //should be updated
    })
  });

});
