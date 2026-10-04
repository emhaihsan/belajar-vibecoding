import { Elysia, t } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .get("/users", async () => db.select().from(users))
  .post(
    "/users",
    async ({ body }) => {
      await db.insert(users).values(body);
      return { success: true };
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }),
      }),
    }
  )
  .listen(Number(process.env.PORT ?? 3000));

console.log(`Server running at http://localhost:${app.server?.port}`);
