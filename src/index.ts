import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .onError(({ error, code, set }) => {
    if (code === "NOT_FOUND") {
      return "NOT_FOUND";
    }

    if (code !== "VALIDATION") {
      console.error(error);
      set.status = 500;
      return { status: "error", error: "Internal Server Error" };
    }
  })
  .get("/health", () => ({ status: "ok" }))
  .group("/api", (app) => app.use(usersRoute))
  .listen(Number(process.env.PORT ?? 3000));

console.log(`Server running at http://localhost:${app.server?.port}`);
