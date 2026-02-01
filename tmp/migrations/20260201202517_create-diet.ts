import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("diet", (table) => {
    table.increments("id");
    table.text("nome").notNullable();
    table.text("descricao").notNullable();
    table.timestamp("data").notNullable();
    table.boolean("is_diet").notNullable();
    table.string("user_id").notNullable();
    table.foreign("user_id").references("id").inTable("users");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("diet");
}
