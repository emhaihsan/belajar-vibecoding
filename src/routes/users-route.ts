import { Elysia, t } from "elysia";
import { registerUser } from "../services/users-service";

export const usersRoute = new Elysia().post(
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
);
