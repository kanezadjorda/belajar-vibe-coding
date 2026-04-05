import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let _db: MySql2Database<typeof schema> | null = null;

export const getDb = async () => {
  if (!_db) {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
    });
    _db = drizzle(connection, { schema, mode: "default" });
  }
  return _db;
};
