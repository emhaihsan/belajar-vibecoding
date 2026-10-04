import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .group("/api", (app) => app.use(usersRoute))
  .listen(Number(process.env.PORT ?? 3000));

console.log(`Server running at http://localhost:${app.server?.port}`);
