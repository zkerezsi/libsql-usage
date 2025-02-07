import { createClient, InValue, ResultSet } from "npm:@libsql/client/node";

export function sql(
  templateStrings: TemplateStringsArray,
  ...args: InValue[]
): Promise<ResultSet> {
  let sql = "";
  for (let i = 0; i < templateStrings.length; i += 1) {
    sql += templateStrings[i];

    if (i < args.length) {
      sql += "?";
    }
  }

  return db.execute({ sql, args });
}

try {
  await Deno.remove("local.db");
} catch {
  //
}

export const db = createClient({
  url: `file:local.db`,
});
