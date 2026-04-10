import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    try {
      await registerUser(body.name, body.email, body.password);
      return { Data: "OK" };
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
    })
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
    })
  })
  .group("", (app) =>
    app
      .derive(({ headers }) => {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return { token: null };
        }
        const token = authHeader.split(" ")[1] || null;
        return { token };
      })
      .onBeforeHandle(({ token, set }) => {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }
      })
      .get("/current", async ({ token, set }) => {
        try {
          // token is guaranteed to exist because of onBeforeHandle
          const user = await getCurrentUser(token!);
          return { Data: user };
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
        }
      })
      .delete("/logout", async ({ token, set }) => {
        try {
          await logoutUser(token!);
          return { Data: "OK" };
        } catch (error: any) {
          set.status = 500;
          return { error: "Internal Server Error" };
        }
      }, {
        detail: {
          tags: ["Users"],
          summary: "Logout Pengguna",
          description: "Menghapus sesi pengguna saat ini di database."
        }
      })
  );
