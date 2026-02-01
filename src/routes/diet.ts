import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../database";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";
export async function dietRoutes(app: FastifyInstance) {
  app.addHook("preHandler", checkSessionIdExists);

  app.post("/", async (request, reply) => {
    const createDieSchema = z.object({
      nome: z.string(),
      descricao: z.string(),
      data: z.string().datetime(),
      is_diet: z.boolean().default(true),
    });

    const { nome, descricao, data, is_diet } = createDieSchema.parse(
      request.body
    );

    const sessionId = request.cookies.sessionId;
    const user = await db("users")
      .where("session_id", sessionId)
      .select("id")
      .first();

    if (!user) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    await db
      .insert({ nome, descricao, data, is_diet, user_id: user.id })
      .into("diet");

    return reply.status(201).send();
  });

  app.get("/", async (request, reply) => {
    const sessionId = request.cookies.sessionId;
    const user = await db("users")
      .where("session_id", sessionId)
      .select("id")
      .first();

    if (!user) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const meals = await db("diet").where("user_id", user.id).select("*");

    return reply.status(200).send({ meals });
  });
}
