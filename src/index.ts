import fastify from "fastify";
import { usersRoutes } from "./routes/users-routes";
import { dietRoutes } from "./routes/diet";
import cookie from "@fastify/cookie";

export const app = fastify();

app.register(cookie);
app.register(usersRoutes, { prefix: "/users" });
app.register(dietRoutes, { prefix: "/diet" });
