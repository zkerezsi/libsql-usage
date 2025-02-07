import { sql } from "./database.ts";
import { asNumber, asString } from "./utils.ts";

export type User = {
  id: number;
  email: string;
  password: string;
};

await sql`CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
)`;

export async function createUser(
  data: { email: string; password: string; id: number },
) {
  return await sql`
    INSERT INTO users (id, email, password)
    VALUES (${data.id}, ${data.email}, ${data.password})
  `;
}

export async function findUserById(id: number): Promise<User | undefined> {
  const rs = await sql`SELECT * FROM users WHERE id = ${id}`;
  if (rs.rows.length === 0) {
    return undefined;
  }

  const row = rs.rows[0];
  return {
    id: asNumber(row["id"]),
    email: asString(row["email"]),
    password: asString(row["password"]),
  };
}
