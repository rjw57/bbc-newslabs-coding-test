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

    it("redacts the location", async () => {
      const { body } = await request(api)
        .get("/submissions/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(body.location).not.toBeDefined();
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

    it("returns the location", async () => {
      const { body } = await request(api)
        .get("/submissions/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(body.location).toBeDefined();
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

describe("POST /submissions", () => {
  afterEach(async () => {
    // Knex appears to be pretty test unfriendly. Other query builders usually
    // let one run tests within a dedicated transaction to avoid side-effects.
    // Knex, it appears, does not: https://github.com/knex/knex/issues/2076.
    //
    // As a work around, delete any submission not created in createData.sql.
    await db.knex.table("submissions").where("id", ">", "3").del();
  });

  describe("with no user", () => {
    it("returns 401 unauthorised", async () => {
      await request(api)
        .post("/submissions")
        .send({ title: "Foo", text: "Bar" })
        .expect(401);
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

    it("allows submissions to be created", async () => {
      const { body } = await request(api)
        .post("/submissions")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Foo", text: "Bar" })
        .expect(201);
      expect(body.id).toBeDefined();
      expect(body.title).toBe("Foo");
      expect(body.text).toBe("Bar");
    });

    it("requires a title", async () => {
      await request(api)
        .post("/submissions")
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "Bar" })
        .expect(400);
    });

    it("requires text", async () => {
      await request(api)
        .post("/submissions")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Bar" })
        .expect(400);
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

    it("submissions cannot be created", async () => {
      await request(api)
        .post("/submissions")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Foo", text: "Bar" })
        .expect(403); // == Forbidden
    });
  });
});
