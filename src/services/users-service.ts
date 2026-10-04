import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResult =
  | { status: "OK" }
  | { status: "error"; error: string };

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing.length > 0) {
    return { status: "error", error: "Email already registered" };
  }

  const hashedPassword = await Bun.password.hash(input.password, {
    algorithm: "bcrypt",
  });

  await db.insert(users).values({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });

  return { status: "OK" };
}

export type LoginResult = { data: string } | { status: "error"; error: string };

const INVALID_CREDENTIALS = "Email atau password salah";

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return { status: "error", error: INVALID_CREDENTIALS };
  }

  const valid = await Bun.password.verify(password, user.password);
  if (!valid) {
    return { status: "error", error: INVALID_CREDENTIALS };
  }

  const token = crypto.randomUUID();
  await db.insert(sessions).values({ token, userId: user.id });

  return { data: token };
}

export type CurrentUserResult =
  | { data: { email: string; name: string } }
  | { status: "error"; error: string };

const USER_NOT_FOUND = "User tidak terdaftar";

export async function getCurrentUser(
  token: string
): Promise<CurrentUserResult> {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) {
    return { status: "error", error: USER_NOT_FOUND };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    return { status: "error", error: USER_NOT_FOUND };
  }

  return { data: { email: user.email, name: user.name } };
}

export type LogoutResult = { data: string } | { error: string };

export async function logoutUser(token: string): Promise<LogoutResult> {
  const result = await db
    .delete(sessions)
    .where(eq(sessions.token, token));

  if (result[0].affectedRows === 0) {
    return { error: "Unauthorized" };
  }

  return { data: "OK" };
}
