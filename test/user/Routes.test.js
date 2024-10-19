const request = require('supertest');
const routes = require('../../Routes');

const api = request(routes);

describe("Test /addFriend/:email", () => {
    test("adds friend", () => {
        return api
            .post("/addFriend/test@example.com")
            .send({ friendEmail: "a@x.com" })
            .expect(200);
    });

    test("fails on invalid email", () => {
        return api
            .post("/addFriend/invalid-email")
            .send({ friendEmail: "x.com" })
            .expect(400);
    });
});
