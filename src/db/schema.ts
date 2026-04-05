import { mysqlTable, serial, text, timestamp } from "drizzle-orm/mysql-core";

export const testTable = mysqlTable("test_connection", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
