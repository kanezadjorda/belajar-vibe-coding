import { Elysia } from "elysia";
import { getDb } from "./db";
import { testTable } from "./db/schema";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .use(usersRoute)
  .get("/", () => "Hello World from Elysia & Bun!")
  .get("/test-db", async () => {
    try {
      const db = await getDb();
      // Menambahkan data baru untuk test
      await db.insert(testTable).values({
        message: "Hello from Drizzle & Elysia! " + new Date().toISOString(),
      });

      // Mengambil semua data dari tabel test
      const results = await db.select().from(testTable);
      return {
        success: true,
        message: "Database connected and query successful",
        data: results,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Database connection failed",
        error: error.message,
      };
    }
  })
  .listen(3000);

console.log(
  `🚀 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
