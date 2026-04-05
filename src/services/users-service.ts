import { getDb } from "../db";
import { usersTable, sessionsTable } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

export const loginUser = async (email: string, password: string) => {
  const database = await getDb();

  // 1. Find user by email
  const userResults = await database
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  const user = userResults[0];

  // 2. Verify user and password
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Email atau Password salah");
  }

  // 3. Generate token
  const token = crypto.randomUUID();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const expiredAt = new Date(Date.now() + oneWeek);

  // 4. Create session
  await database.insert(sessionsTable).values({
    token,
    userId: user.id,
    expiredAt,
  });

  return token;
};

export const getCurrentUser = async (token: string) => {
  const database = await getDb();

  // 1. Join sessions and users to find current user
  const results = await database
    .select({
      id: usersTable.id,
      email: usersTable.email,
      createdAt: usersTable.createdAt,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.token, token))
    .limit(1);

  const currentUser = results[0];

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  return currentUser;
};
