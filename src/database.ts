import knex from "knex";
import { Knex as KnexType } from "knex";

export const config: KnexType.Config = {
  client: "sqlite3",
  connection: {
    filename: "./tmp/dailydiet.db",
  },
  migrations: {
    directory: "./tmp/migrations",
    extension: "ts",
  },
  useNullAsDefault: true,
};

export const db = knex(config);
