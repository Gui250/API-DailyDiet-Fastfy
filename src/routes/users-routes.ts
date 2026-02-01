import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../database";
import { randomUUID } from "node:crypto";
export async function usersRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const userSchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    const { name, email } = userSchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      });
    }

    await db("users").insert({ name, email, session_id: sessionId });

    return reply.status(201).send();
  });

  app.get("/:id", async (request, reply) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getUserParamsSchema.parse(request.params);

    const user = await db.select("*").from("users").where("id", id).first();

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    return reply.status(200).send(user);
  });
}
