import { Elysia, t } from "elysia";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/users-service";
import { extractBearerToken } from "../lib/auth";

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
      name: t.String({ minLength: 1, maxLength: 255 }),
      email: t.String({ minLength: 1, maxLength: 255 }),
      password: t.String({ minLength: 1, maxLength: 100 }),
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
        email: t.String({ minLength: 1, maxLength: 255 }),
        password: t.String({ minLength: 1, maxLength: 100 }),
      }),
    }
  )
  .post("/user/current", async ({ headers, set }) => {
    const token = extractBearerToken(headers);

    if (!token) {
      set.status = 401;
      return UNAUTHORIZED;
    }

    const result = await getCurrentUser(token);

    if ("status" in result) {
      set.status = 401;
    }

    return result;
  })
  .delete("/user/current", async ({ headers, set }) => {
    const token = extractBearerToken(headers);

    if (!token) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const result = await logoutUser(token);

    if ("error" in result) {
      set.status = 401;
    }

    return result;
  });
