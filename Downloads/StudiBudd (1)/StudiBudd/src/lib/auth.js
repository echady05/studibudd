import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const AuthPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
});

const DEFAULT_JWT_SECRET = "dev-studibudd-change-me";

function getJwtSecret() {
  return process.env.STUDIBUDD_JWT_SECRET || DEFAULT_JWT_SECRET;
}

export function createToken({ userId, email }) {
  const secret = getJwtSecret();
  const payload = { sub: userId, email };
  // 7 days is fine for local; adjust for production later.
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token) {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret);
  const parsed = AuthPayloadSchema.safeParse(decoded);
  if (!parsed.success) throw new Error("Bad token payload");
  return parsed.data;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function getBearerTokenFromRequest(req) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length !== 2) return null;
  if (parts[0].toLowerCase() !== "bearer") return null;
  return parts[1];
}

