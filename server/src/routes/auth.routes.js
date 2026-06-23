import { Router } from "express";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { query, withTransaction } from "../db.js";
import { asyncHandler } from "../lib/async-handler.js";
import { HttpError } from "../lib/http-error.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { createAccessToken } from "../services/token.service.js";
import { presentClient } from "../lib/client-presenter.js";

export const authRouter = Router();

authRouter.post("/register", validate("body", registerSchema), asyncHandler(async (request, response) => {
  const input = request.validated.body;
  const passwordHash = await bcrypt.hash(input.password, 12);
  const userId = randomUUID();

  const client = await withTransaction(async (database) => {
    const existingClients = await database.query("SELECT client_id, full_name, email, mobile FROM clients WHERE lower(email) = $1 OR mobile = $2", [input.email, input.mobile]);
    let linkedClient = existingClients.rows[0];

    if (existingClients.rows.length > 1) throw new HttpError(409, "Email or mobile number is already linked to another client");
    if (linkedClient && (linkedClient.email.toLowerCase() !== input.email || linkedClient.mobile !== input.mobile)) {
      throw new HttpError(409, "Email or mobile number is already linked to another client");
    }

    if (!linkedClient) {
      await database.query("LOCK TABLE clients IN EXCLUSIVE MODE");
      const nextIdResult = await database.query("SELECT COALESCE(MAX(client_id), 0) + 1 AS next_id FROM clients");
      const clientId = nextIdResult.rows[0].next_id;
      const insertResult = await database.query(
        `INSERT INTO clients (client_id, full_name, email, mobile, city, state, age, gender, occupation, health_condition, beauty_goal, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CURRENT_TIMESTAMP)
         RETURNING client_id, full_name, email`,
        [clientId, input.fullName, input.email, input.mobile, input.city, input.state, input.age, input.gender, input.occupation, input.healthCondition, input.beautyGoal],
      );
      linkedClient = insertResult.rows[0];
    }

    const existingUser = await database.query("SELECT id FROM users WHERE lower(email) = $1 OR client_id = $2", [input.email, linkedClient.client_id]);
    if (existingUser.rows[0]) throw new HttpError(409, "An account already exists for this client");

    await database.query(
      "INSERT INTO users (id, email, password_hash, role, client_id) VALUES ($1, $2, $3, 'USER', $4)",
      [userId, linkedClient.email.toLowerCase(), passwordHash, linkedClient.client_id],
    );
    return linkedClient;
  });

  const accessToken = createAccessToken({ sub: userId, role: "USER", clientId: client.client_id });
  response.status(201).json({ data: { accessToken, user: { id: userId, email: client.email.toLowerCase(), role: "USER", clientId: client.client_id, name: client.full_name } } });
}));

authRouter.post("/login", validate("body", loginSchema), asyncHandler(async (request, response) => {
  const { email, password } = request.validated.body;
  const result = await query(
    `SELECT u.id, u.email, u.password_hash, u.role, u.client_id, c.full_name
     FROM users u LEFT JOIN clients c ON c.client_id = u.client_id WHERE u.email = $1`, [email],
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new HttpError(401, "Email or password is incorrect");
  const accessToken = createAccessToken({ sub: user.id, role: user.role, clientId: user.client_id });
  response.json({ data: { accessToken, user: { id: user.id, email: user.email, role: user.role, clientId: user.client_id, name: user.full_name ?? "Administrator" } } });
}));

authRouter.get("/me", requireAuth, asyncHandler(async (request, response) => {
  const result = await query(
    `SELECT u.id AS user_id, u.email AS user_email, u.role, u.client_id, c.*
     FROM users u LEFT JOIN clients c ON c.client_id = u.client_id WHERE u.id = $1`, [request.auth.userId],
  );
  const user = result.rows[0];
  if (!user) throw new HttpError(404, "User account was not found");
  response.json({ data: { id: user.user_id, email: user.user_email, role: user.role, clientId: user.client_id, name: user.full_name ?? "Administrator", client: user.client_id ? presentClient(user) : null } });
}));
