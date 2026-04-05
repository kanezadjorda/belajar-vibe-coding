import { getDb } from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const registerUser = async (name: string, email: string, password: string) => {
  const database = await getDb();

  // 1. Check if email already exists
  const existingUser = await database
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Insert user
  await database.insert(usersTable).values({
    name,
    email,
    password: hashedPassword,
  });

  return { success: true };
};
