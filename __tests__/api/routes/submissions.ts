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

    describe("with some comments", () => {
      let s1: number, s2: number;
      beforeEach(async () => {
        ({ id: s1 } = await db.createSubmission(1, {
          title: "Sub 1",
          text: "1",
        }));
        ({ id: s2 } = await db.createSubmission(2, {
          title: "Sub 2",
          text: "2",
        }));
        await db.createComment(s1, { user_id: 3, text: "comment 1" });
        await db.createComment(s1, { user_id: 2, text: "comment 2" });
        await db.createComment(s2, { user_id: 1, text: "comment 3" });
      });

      afterEach(async () => {
        await db.knex.from("comments").del();
        await db.knex.from("submissions").where("id", "=", s1).del();
        await db.knex.from("submissions").where("id", "=", s2).del();
      });

      it("returns the correct number of comments", async () => {
        const { body } = await request(api)
          .get("/submissions")
          .set("Authorization", `Bearer ${token}`)
          .expect(200);
        expect(body.find(({ id }: { id: number }) => id === s1)).toMatchObject({
          comment_count: 2,
        });
        expect(body.find(({ id }: { id: number }) => id === s2)).toMatchObject({
          comment_count: 1,
        });
      });
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

describe("GET /submissions/:id/comments", () => {
  let token: string | undefined = undefined;
  let s1: number, s2: number;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    token = await db.createToken("John");
    ({ id: s1 } = await db.createSubmission(1, { title: "Sub 1", text: "1" }));
    ({ id: s2 } = await db.createSubmission(2, { title: "Sub 2", text: "2" }));
    await db.createComment(s1, { user_id: 3, text: "comment 1" });
    await db.createComment(s1, { user_id: 2, text: "comment 2" });
    await db.createComment(s2, { user_id: 1, text: "comment 3" });
  });

  afterEach(async () => {
    token = undefined;
    await db.knex.from("comments").del();
    await db.knex.from("submissions").where("id", "=", s1).del();
    await db.knex.from("submissions").where("id", "=", s2).del();
  });

  it("returns the comments", async () => {
    const { body } = await request(api)
      .get(`/submissions/${s1}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(body.comments?.length).toBe(2);
    expect(body.comments).toEqual([
      expect.objectContaining({
        text: "comment 1",
        username: "Kyra",
        user_id: 3,
      }),
      expect.objectContaining({
        text: "comment 2",
        username: "Aisha",
        user_id: 2,
      }),
    ]);
  });
});

describe("POST /submissions/:id/comments", () => {
  afterEach(async () => {
    await db.knex.from("comments").del();
  });

  describe("with no user", () => {
    it("returns 401 unauthorised", async () => {
      await request(api)
        .post("/submissions/1/comments")
        .send({ text: "Bar" })
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

    describe("who does not own the submission", () => {
      const submissionId = 1;

      it("does not allow comments to be created", async () => {
        await request(api)
          .post(`/submissions/${submissionId}/comments`)
          .set("Authorization", `Bearer ${token}`)
          .send({ text: "Bar" })
          .expect(403);
      });
    });

    describe("who owns the submission", () => {
      const submissionId = 3;

      it("allows comments to be created", async () => {
        await request(api)
          .post(`/submissions/${submissionId}/comments`)
          .set("Authorization", `Bearer ${token}`)
          .send({ text: "Bar" })
          .expect(201);
      });

      it("requires text", async () => {
        await request(api)
          .post(`/submissions/${submissionId}/comments`)
          .set("Authorization", `Bearer ${token}`)
          .send({})
          .expect(400);
      });
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

    it("allows comments to be created", async () => {
      await request(api)
        .post(`/submissions/1/comments`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "Bar" })
        .expect(201);
    });

    it("returns a 404 for a submission which does not exist", async () => {
      await request(api)
        .post(`/submissions/1000/comments`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "Bar" })
        .expect(404);
    });
  });
});
