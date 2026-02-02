import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../database";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";

export async function dietRoutes(app: FastifyInstance) {
  app.addHook("preHandler", checkSessionIdExists);

  async function getUserIdBySession(sessionId?: string) {
    if (!sessionId) {
      return null;
    }
    const user = await db("users")
      .where("session_id", sessionId)
      .select("id")
      .first();

    return user?.id ?? null;
  }

  app.post("/", async (request, reply) => {
    try {
      const createDieSchema = z.object({
        nome: z.string(),
        descricao: z.string(),
        data: z.string().datetime(),
        is_diet: z.boolean().default(true),
      });

      const { nome, descricao, data, is_diet } = createDieSchema.parse(
        request.body
      );

      const userId = await getUserIdBySession(request.cookies?.sessionId);
      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      await db
        .insert({
          nome,
          descricao,
          data,
          is_diet,
          user_id: String(userId),
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
      const userId = await getUserIdBySession(request.cookies?.sessionId);
      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      const diets = await db("diet").select("*").where("user_id", userId);
      return reply.status(200).send(diets);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return reply.status(500).send({ error: message });
    }
  });

  app.put("/:id", async (request, reply) => {
    const userId = await getUserIdBySession(request.cookies?.sessionId);
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

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

    const updatedRows = await db("diet")
      .where({ id, user_id: userId })
      .update({ nome, descricao, data, is_diet });

    if (updatedRows === 0) {
      return reply.status(404).send({ error: "Diet not found" });
    }

    return reply.status(204).send();
  });

  app.delete("/:id", async (request, reply) => {
    const userId = await getUserIdBySession(request.cookies?.sessionId);
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const deleteDietParamsSchema = z.object({
      id: z.coerce.number(),
    });

    const { id } = deleteDietParamsSchema.parse(request.params);

    const deletedRows = await db("diet")
      .where({ id, user_id: userId })
      .delete();

    if (deletedRows === 0) {
      return reply.status(404).send({ error: "Diet not found" });
    }

    return reply.status(204).send();
  });

  app.get("/:id", async (request, reply) => {
    const userId = await getUserIdBySession(request.cookies?.sessionId);
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const getDietParamsSchema = z.object({
      id: z.coerce.number(),
    });

    const { id } = getDietParamsSchema.parse(request.params);

    const diet = await db("diet").where({ id, user_id: userId }).first();

    if (!diet) {
      return reply.status(404).send({ error: "Diet not found" });
    }

    return reply.status(200).send(diet);
  });

  app.get("/summary_total_refeicao", async (request, reply) => {
    const userId = await getUserIdBySession(request.cookies?.sessionId);
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const summaryQtdTotalRefeicaoPorUser = await db("diet")
      .count("id")
      .where("user_id", userId);

    return reply.status(200).send(summaryQtdTotalRefeicaoPorUser);
  });

  app.get("/summary_total_refeicao_diet", async (request, reply) => {
    const userId = await getUserIdBySession(request.cookies?.sessionId);
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const summaryQtdTotalRefeicaoDietPorUser = await db("diet")
      .count("id")
      .where("user_id", userId)
      .where("is_diet", true);

    return reply.status(200).send(summaryQtdTotalRefeicaoDietPorUser);
  });

  app.get("/summary_total_refeicao_nao_diet", async (request, reply) => {
    const userId = await getUserIdBySession(request.cookies?.sessionId);
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const summaryQtdTotalRefeicaoNaoDietPorUser = await db("diet")
      .count("id")
      .where("user_id", userId)
      .where("is_diet", false);

    return reply.status(200).send(summaryQtdTotalRefeicaoNaoDietPorUser);
  });

  app.get("/summary_best_sequence_diet", async (request, reply) => {
    const userId = await getUserIdBySession(request.cookies?.sessionId);
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const summaryBestSequenceDietPorUser = await db("diet")
      .where("user_id", userId)
      .where("is_diet", true)
      .orderBy("data", "asc")
      .select("data")
      .limit(1);

    return reply.status(200).send(summaryBestSequenceDietPorUser);
  });
}
