import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../database";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";

export async function dietRoutes(app: FastifyInstance) {
  app.addHook("preHandler", checkSessionIdExists);

  app.post("/", async (request, reply) => {
    try {
      const createDietSchema = z.object({
        nome: z.string(),
        descricao: z.string(),
        data: z.string().datetime(),
        is_diet: z.boolean().default(true),
      });

      const { nome, descricao, data, is_diet } = createDietSchema.parse(
        request.body
      );

      const sessionId = request.cookies?.sessionId;
      const user = await db("users")
        .where("session_id", sessionId)
        .select("id")
        .first();

      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      await db
        .insert({
          nome,
          descricao,
          data,
          is_diet,
          user_id: String(user.id),
        })
        .into("diet");

      return reply.status(201).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return reply.status(error instanceof z.ZodError ? 400 : 500).send({
        error: message,
      });
    }
  });

  app.get("/", async (request, reply) => {
    try {
      const sessionId = request.cookies?.sessionId;
      const user = await db("users")
        .where("session_id", sessionId)
        .select("id")
        .first();
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      const diets = await db("diet").select("*").where("user_id", user.id);
      return reply.status(200).send(diets);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return reply.status(500).send({ error: message });
    }
  });

  app.put("/:id", async (request, reply) => {
    const updateDietParamsSchema = z.object({
      id: z.coerce.number(),
    });

    const { id } = updateDietParamsSchema.parse(request.params);

    const updateDietBodySchema = z.object({
      nome: z.string(),
      descricao: z.string(),
      data: z.string().datetime({ offset: true }),
      is_diet: z.boolean().default(true),
    });

    const { nome, descricao, data, is_diet } = updateDietBodySchema.parse(
      request.body
    );

    await db("diet").where("id", id).update({ nome, descricao, data, is_diet });

    return reply.status(204).send();
  });
}
