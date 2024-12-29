const UserConnector = require('../../src/user/MongoConnector');
const UserController = require('../../src/user/Controller');
const User = require('../../src/user/Model');

const routes = require("../../src/App");
const request = require("supertest");
const api = request(routes);
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

  describe("Test setDisplayName", () => {
    beforeAll(async () => {
      await UserConnector.connectToDatabase();
      await UserConnector.testOnlyDeleteAll();
    });

    afterAll(async () => {
      await UserConnector.testOnlyDeleteAll();
      await mongoose.connection.close();
    });

    test("should update display name", async () => {
      await UserConnector.insertUser(
        new User({ email: "test2@example.com", displayName: "test1" })
      );

      const response1 = await api
        .post(`/setDisplayName`)
        .set({ userEmail: "test2@example.com" }) //simulate auth implicitly setting email
        .send({ displayName: "test2" });

      expect(response1.status).toBe(200);

      const response2 = await UserConnector.getUser("test2@example.com");
      expect(response2.displayName).toEqual("test2");
    });
  });

  describe("Test setLanguage", () => {
    beforeAll(async () => {
      await UserConnector.connectToDatabase();
      await UserConnector.testOnlyDeleteAll();
    });

    afterAll(async () => {
      await UserConnector.testOnlyDeleteAll();
      await mongoose.connection.close();
    });

    test("should update language", async () => {
      await UserConnector.insertUser(new User({ email: "test2@example.com" }));

      const response1 = await api
        .post(`/setLanguage`)
        .set({ userEmail: "test2@example.com" }) //simulate auth implicitly setting email
        .send({ language: "en" });

      expect(response1.status).toBe(200);

      const response2 = await UserConnector.getUser("test2@example.com");
      expect(response2.language).toEqual("en");
    });
  });
});
