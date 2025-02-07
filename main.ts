import { assertEquals } from "jsr:@std/assert";
import { createClient, InValue, ResultSet } from "npm:@libsql/client/node";

export const client = createClient({
  url: `file:local.db`,
});

export const sql = (
  parts: TemplateStringsArray,
  ...args: InValue[]
): Promise<ResultSet> =>
  client.execute({
    sql: parts.reduce(
      (acc, curr, i) => `${acc}${curr}${i < args.length ? "?" : ""}`,
      ""
    ),
    args,
  });

Deno.test("libsql", async (t) => {
  await sql`DROP TABLE users`;

  await sql`CREATE TABLE users(
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`;

  await sql`
    INSERT INTO users (id, email, password)
    VALUES (${1}, ${"email@email.com"}, ${"password"})
  `;

  await sql`
    INSERT INTO users (id, email, password)
    VALUES (${2}, ${"email2@email.com"}, ${"password"})
  `;

  await t.step("retrieves row using tagged template literal", async () => {
    const rs = await sql`SELECT * FROM users WHERE id = ${1}`;

    assertEquals(rs.rows[0]["email"], "email@email.com");
    assertEquals(rs.rows[0]["password"], "password");
    assertEquals(rs.rows[0]["id"], 1);
  });

  await t.step("does not sanitize using tagged template literal", async () => {
    const harmfulInput = "1 OR id = 2";

    await sql`SELECT * FROM users WHERE id = ${harmfulInput}`;

    const rs = await sql`SELECT * FROM users`;
    assertEquals(rs.rows.length, 2);
  });

  await t.step("does not sanitize using plain execute command", async () => {
    const harmfulInput = "1 OR id = 2";

    await client.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [harmfulInput],
    });

    const rs = await sql`SELECT * FROM users`;
    assertEquals(rs.rows.length, 2);
  });
});
