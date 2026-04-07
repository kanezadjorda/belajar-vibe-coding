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
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String()
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
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  })
  .get("/current", async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const parts = authHeader.split(" ");
      const token = parts.length > 1 ? parts[1] : null;

      if (!token) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const user = await getCurrentUser(token);

      return { Data: user };
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      set.status = 500;
      return { error: "Internal Server Error" };
    }
  })
  .delete("/logout", async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const parts = authHeader.split(" ");
      const token = parts.length > 1 ? parts[1] : null;

      if (!token) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      await logoutUser(token);

      return { Data: "OK" };
    } catch (error: any) {
      set.status = 500;
      return { error: "Internal Server Error" };
    }
  });
