import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../database";
export async function usersRoutes(app: FastifyInstance) {
  app.post("/users", async (request, reply) => {
    const userSchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    const { name, email } = userSchema.parse(request.body);

    await db.insert({ name, email }).into("users");

    return reply.status(201).send();
  });
}
