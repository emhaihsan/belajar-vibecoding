import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

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
