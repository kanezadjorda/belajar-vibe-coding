import { Elysia } from "elysia";
import { getDb } from "./db";
import { testTable } from "./db/schema";
import { usersRoute } from "./routes/users-route";
import { swagger } from "@elysiajs/swagger";

export const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: "Belajar Vibe Coding API",
        version: "1.0.0",
        description: "Dokumentasi API untuk manajemen user menggunakan Bun & Elysia"
      },
      tags: [
        { name: "Users", description: "Endpoint manajemen pengguna" },
        { name: "Utility", description: "Endpoint utilitas aplikasi" }
      ]
    }
  }))
  .use(usersRoute)
  .get("/", () => "Hello World from Elysia & Bun!", {
    detail: {
      tags: ["Utility"],
      summary: "Endpoint Index",
      description: "Menampilkan pesan sapaan default"
    }
  })
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
  }, {
    detail: {
      tags: ["Utility"],
      summary: "Test Database Connection",
      description: "Menguji koneksi database dengan melakukan operasi insert dan select sederhana"
    }
  });

app.listen(3000);

console.log(
  `🚀 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
