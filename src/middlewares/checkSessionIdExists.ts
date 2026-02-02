import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../database";
export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionId = request.cookies?.sessionId;

  if (!sessionId) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}
