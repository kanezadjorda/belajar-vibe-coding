import { Elysia, t } from "elysia";
import { getDb } from "./db";
import { testTable } from "./db/schema";
import { usersPlugin } from "./routes/users-route";
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
  .use(usersPlugin)
  .get("/", () => ({ data: "Hello World from Elysia & Bun!" }), {
    detail: {
      tags: ["Utility"],
      summary: "Endpoint Index",
      description: "Menampilkan pesan sapaan default"
    },
    response: {
      200: t.Object({ data: t.String({ default: "Hello World from Elysia & Bun!" }) })
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
    },
    response: {
      200: t.Object({
        success: t.Boolean({ default: true }),
        message: t.String({ default: "Database connected and query successful" }),
        data: t.Optional(t.Array(t.Object({
          id: t.Number({ default: 1 }),
          message: t.String({ default: "Hello from Drizzle & Elysia!" }),
          createdAt: t.Any({ default: "2024-04-10T12:00:00.000Z" })
        })))
      })
    }
  })
  .listen(3000);

console.log(
  `🚀 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
