import request from "supertest";
import api from "../../../src/api/index";
import * as db from "../../../src/api/db";

describe("GET /users", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns a 200 Status Code", async () => {
    await request(api).get("/users").expect(200);
  });

  it("returns a list of users", async () => {
    const { body } = await request(api).get("/users");

    expect(body.length).toBe(3);
  });

  describe("DB Failure", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation(() => jest.fn());
      jest.spyOn(db, "getUsersAndRoles").mockRejectedValue(new Error());
    });

    it("returns a 500 Status Code", async () => {
      await request(api).get("/users").expect(500);
    });
  });
});

describe("GET /users/me", () => {
  describe("with no user", () => {
    it("returns the anonymous user", async () => {
      const { body } = await request(api).get("/users/me").expect(200);
      expect(body.isAnonymous).toBe(true);
    });
  });

  describe("with a member of the public", () => {
    let token: string | undefined = undefined;

    beforeEach(async () => {
      token = await db.createToken("Kyra");
    });

    afterEach(() => {
      token = undefined;
    });

    it("the auth token exists", () => {
      expect(token).toBeDefined();
    });

    it("returns a user with the correct data", async () => {
      const { body } = await request(api)
        .get("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      expect(body).toMatchObject({
        username: "Kyra",
        id: 3,
        description: "public",
        isAnonymous: false,
      });
      expect(body.created_at).toBeDefined();
    });
  });
});
