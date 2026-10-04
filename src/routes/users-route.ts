import { Elysia, t } from "elysia";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/users-service";

const UNAUTHORIZED = { status: "error", error: "User tidak terdaftar" };

export const usersRoute = new Elysia()
  .post(
  "/user",
  async ({ body, set }) => {
    const result = await registerUser(body);

    if (result.status === "error") {
      set.status = 409;
    }

    return result;
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
    }),
  }
)
  .post(
    "/user/login",
    async ({ body, set }) => {
      const result = await loginUser(body.email, body.password);

      if ("status" in result) {
        set.status = 401;
      }

      return result;
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post("/user/current", async ({ headers, set }) => {
    const authorization = headers["authorization"];
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      set.status = 401;
      return UNAUTHORIZED;
    }

    const result = await getCurrentUser(token);

    if ("status" in result) {
      set.status = 401;
    }

    return result;
  });
