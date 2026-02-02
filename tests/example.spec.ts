import { it, beforeAll, afterAll, describe, expect } from "vitest";
import request from "supertest";
import { app } from "../src/index";

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("Users routes", () => {
  it("should be able to create a new user", async () => {
    const response = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
        email: `john.doe.${Date.now()}@example.com`,
      });

    if (response.status !== 201) {
      console.error("Erro na criação do usuário:", response.body);
    }
    expect(response.status).toBe(201);
  });

  it("should be able to list all users", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "John Doe",
      email: `john.doe@example.com`,
    });

    const cookies = createUserResponse.get("Set-Cookie");

    const listUsersResponse = await request(app.server)
      .get("/users")
      .set("Cookie", cookies)
      .expect(200);

    console.log(listUsersResponse.body);
  });
});

describe("Diet routes", () => {
  let sessionCookie: string;

  beforeAll(async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Test User",
        email: `test.${Date.now()}@example.com`,
      });
    const setCookie = createUserResponse.get("Set-Cookie");
    const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    sessionCookie = cookieStr?.split(";")[0] ?? "";
  });

  it("should be able to create a new diet", async () => {
    const response = await request(app.server)
      .post("/diet")
      .set("Cookie", sessionCookie)
      .send({
        nome: "Pizza",
        descricao: "Pizza de calabresa com muito queijo",
        data: new Date().toISOString(),
        is_diet: true,
      });
    if (response.status !== 201) {
      console.error("Erro ao criar dieta:", response.body);
    }
    expect(response.status).toBe(201);
  });

  it("should be able to list all diets", async () => {
    const response = await request(app.server)
      .get("/diet")
      .set("Cookie", sessionCookie);
    if (response.status !== 200) {
      console.error("Erro ao listar dietas:", response.body);
    }
    expect(response.status).toBe(200);
  });
});
