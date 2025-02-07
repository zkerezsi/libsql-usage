import { assertEquals } from "jsr:@std/assert";
import { createClient, InValue, ResultSet } from "npm:@libsql/client/node";

try {
  await Deno.remove("local.db");
} catch {
  //
}

export const db = createClient({
  url: `file:local.db`,
});

export const sql = (
  parts: TemplateStringsArray,
  ...args: InValue[]
): Promise<ResultSet> =>
  db.execute({
    sql: parts.reduce(
      (acc, curr, i) => `${acc}${curr}${i < args.length ? ` ?` : ""}`,
      "",
    ),
    args,
  });

const email = "email@email.com";
const password = "supersecret123";
const id = 1;

Deno.test("libsql with tagged template literal", async (t) => {
  await sql`CREATE TABLE users(
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`;

  await sql`
    INSERT INTO users (id, email, password)
    VALUES (${id}, ${email}, ${password})
  `;

  await t.step("retrieves row", async () => {
    const rs = await sql`SELECT * FROM users WHERE id = ${id}`;

    assertEquals(rs.rows[0]["email"], email);
    assertEquals(rs.rows[0]["password"], password);
    assertEquals(rs.rows[0]["id"], id);
  });

  await t.step("resists sql injection", async () => {
    const harmfulInput = "0; DROP TABLE users --";
    await sql`SELECT * FROM users WHERE id = ${harmfulInput}`;

    const rs = await sql`SELECT name FROM sqlite_master WHERE type='table'`;
    assertEquals(rs.rows[0]["name"], "users");
  });
});
