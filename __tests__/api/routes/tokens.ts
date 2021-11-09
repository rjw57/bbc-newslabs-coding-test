import request from "supertest";
import api from "../../../src/api/index";

describe("POST /tokens", () => {
  it("creates a token", async () => {
    const { body } = await request(api)
      .post("/tokens")
      .send({ username: "John" })
      .expect(201);
    expect(body.token).toBeDefined();
  });

  describe("with a non-existant user", () => {
    it("returns a bad request response", async () => {
      await request(api)
        .post("/tokens")
        .send({ username: "Jack the Ripper" })
        .expect(400);
    });
  });
});
