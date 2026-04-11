import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-service";

export const usersPlugin = (app: Elysia) => 
  app.group("/api/users", (group) =>
    group
      .post("/", async ({ body, set }) => {
        try {
          await registerUser(body.name, body.email, body.password);
          return { data: "OK" };
        } catch (error: any) {
          if (error.message === "Email sudah terdaftar") {
            set.status = 400;
            return { error: error.message };
          }
          set.status = 500;
          return { error: "Internal Server Error" };
        }
      }, {
        detail: {
          tags: ["Users"],
          summary: "Registrasi Pengguna Baru",
          description: "Mendaftarkan pengguna baru dengan nama, email, dan password."
        },
        body: t.Object({
          name: t.String({ maxLength: 255 }),
          email: t.String({ maxLength: 255, format: "email" }),
          password: t.String({ maxLength: 255 })
        }),
        response: {
          200: t.Object({ data: t.String({ default: "OK" }) }),
          400: t.Object({ error: t.String({ default: "Email sudah terdaftar" }) }),
          500: t.Object({ error: t.String({ default: "Internal Server Error" }) })
        }
      })
      .post("/login", async ({ body, set }) => {
        try {
          const token = await loginUser(body.email, body.password);
          return { data: token };
        } catch (error: any) {
          if (error.message === "Email atau Password salah") {
            set.status = 400;
            return { error: error.message };
          }
          set.status = 500;
          return { error: "Internal Server Error" };
        }
      }, {
        detail: {
          tags: ["Users"],
          summary: "Login Pengguna",
          description: "Melakukan otentikasi pengguna dan mengembalikan token sesi."
        },
        body: t.Object({
          email: t.String(),
          password: t.String()
        }),
        response: {
          200: t.Object({ data: t.String({ default: "8d09f825-2c05-41a7-8616-3d8decfe139a" }) }),
          400: t.Object({ error: t.String({ default: "Email atau Password salah" }) }),
          500: t.Object({ error: t.String({ default: "Internal Server Error" }) })
        }
      })
      .derive(({ headers }) => {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return { token: null };
        }
        const token = authHeader.split(" ")[1] || null;
        return { token };
      })
      .onBeforeHandle(({ token, set }: any) => {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }
      })
      .get("/current", async ({ token, set }) => {
        try {
          // token is guaranteed to exist because of onBeforeHandle
          const user = await getCurrentUser(token!);
          return { data: user };
        } catch (error: any) {
          if (error.message === "Unauthorized") {
            set.status = 401;
            return { error: "Unauthorized" };
          }
          set.status = 500;
          return { error: "Internal Server Error" };
        }
      }, {
        detail: {
          tags: ["Users"],
          summary: "Profil Pengguna Terkini",
          description: "Mengambil informasi profil dari pengguna yang sedang login berdasarkan token Bearer."
        },
        response: {
          200: t.Object({
            data: t.Object({
              id: t.Number({ default: 1 }),
              email: t.String({ default: "user@example.com" }),
              createdAt: t.Any({ default: "2024-04-10T12:00:00.000Z" })
            })
          }),
          401: t.Object({ error: t.String({ default: "Unauthorized" }) }),
          500: t.Object({ error: t.String({ default: "Internal Server Error" }) })
        }
      })
      .delete("/logout", async ({ token, set }) => {
        try {
          await logoutUser(token!);
          return { data: "OK" };
        } catch (error: any) {
          set.status = 500;
          return { error: "Internal Server Error" };
        }
      }, {
        detail: {
          tags: ["Users"],
          summary: "Logout Pengguna",
          description: "Menghapus sesi pengguna saat ini di database."
        },
        response: {
          200: t.Object({ data: t.String({ default: "OK" }) }),
          401: t.Object({ error: t.String({ default: "Unauthorized" }) }),
          500: t.Object({ error: t.String({ default: "Internal Server Error" }) })
        }
      })
  );
