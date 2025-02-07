import { assertEquals } from "jsr:@std/assert";
import { createUser, findUserById } from "./database/user.ts";

Deno.test("libsql", async () => {
  await createUser({
    email: "email@email.com",
    password: "supersecret123",
    id: 1,
  });

  const user = await findUserById(1);

  assertEquals(user, {
    email: "email@email.com",
    password: "supersecret123",
    id: 1,
  });
});

