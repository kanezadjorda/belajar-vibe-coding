import { mysqlTable, serial, text, timestamp, varchar, int, bigint } from "drizzle-orm/mysql-core";

export const testTable = mysqlTable("test_connection", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersTable = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessionsTable = mysqlTable("sessions", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 255 }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiredAt: timestamp("expired_at").notNull(),
});
