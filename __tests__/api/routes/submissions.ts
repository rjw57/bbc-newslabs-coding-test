import request from "supertest";
import api from "../../../src/api/index";
import * as db from "../../../src/api/db";

describe("GET /submissions", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("with no user", () => {
    it("returns a 401 Status Code", async () => {
      await request(api).get("/submissions").expect(401);
    });
  });

  describe("with a member of the public", () => {
    let token: string | undefined = undefined;

    beforeEach(async () => {
      token = await db.createToken("Aisha");
    });

    afterEach(() => {
      token = undefined;
    });

    it("the auth token exists", () => {
      expect(token).toBeDefined();
    });

    it("returns only that user's submissions", async () => {
      const { body } = await request(api)
        .get("/submissions")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      expect(body.length).toBe(2);
    });
  });

  describe("with a journalist", () => {
    let token: string | undefined = undefined;

    beforeEach(async () => {
      token = await db.createToken("John");
    });

    afterEach(() => {
      token = undefined;
    });

    it("the auth token exists", () => {
      expect(token).toBeDefined();
    });

    it("returns all submissions", async () => {
      const { body } = await request(api)
        .get("/submissions")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      expect(body.length).toBe(3);
    });

    describe("with a DB Failure", () => {
      beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => jest.fn());
        jest
          .spyOn(db, "getSubmissionsAndUsers")
          .mockRejectedValue(new Error("A teststring"));
      });

      it("returns a 500 Status Code", async () => {
        await request(api)
          .get("/submissions")
          .set("Authorization", `Bearer ${token}`)
          .expect(500);
      });
    });
  });
});

describe("GET /submissions/:id", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("with no user", () => {
    it("returns a 401 Status Code", async () => {
      await request(api).get("/submissions/1").expect(401);
    });
  });

  describe("with the submitter", () => {
    let token: string | undefined = undefined;

    beforeEach(async () => {
      token = await db.createToken("Aisha");
    });

    afterEach(() => {
      token = undefined;
    });

    it("returns a 200 Status Code", async () => {
      await request(api)
        .get("/submissions/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
    });

    it("returns the requested submission", async () => {
      const { body } = await request(api)
        .get("/submissions/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(body.id).toBe(1);
    });

    describe("with a DB Failure", () => {
      beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => jest.fn());
        jest
          .spyOn(db, "getSubmissionAndUser")
          .mockRejectedValue(new Error("A teststring"));
      });

      it("returns a 500 Status Code", async () => {
        await request(api)
          .get("/submissions/1")
          .set("Authorization", `Bearer ${token}`)
          .expect(500);
      });
    });
  });

  describe("with a different memeber of the public", () => {
    let token: string | undefined = undefined;

    beforeEach(async () => {
      token = await db.createToken("Kyra");
    });

    afterEach(() => {
      token = undefined;
    });

    it("returns a 403 Status Code", async () => {
      await request(api)
        .get("/submissions/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(403);
    });
  });

  describe("with a journalist", () => {
    let token: string | undefined = undefined;

    beforeEach(async () => {
      token = await db.createToken("John");
    });

    afterEach(() => {
      token = undefined;
    });

    it("returns a 200 Status Code", async () => {
      await request(api)
        .get("/submissions/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
    });

    it("returns a 404 Status Code for a non-existant submission", async () => {
      await request(api)
        .get("/submissions/100")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });

    it("returns the requested submission", async () => {
      const { body } = await request(api)
        .get("/submissions/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(body.id).toBe(1);
    });
  });
});
