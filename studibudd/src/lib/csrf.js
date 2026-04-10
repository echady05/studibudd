import { randomUUID } from "crypto";

const CSRF_COOKIE_NAME = "studiBudd_csrf";
const CSRF_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 60 * 60,
};

export function generateCsrfToken() {
  return randomUUID();
}

export function setCsrfCookie(res, token) {
  res.cookies.set(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS);
}

export function validateCsrfToken(req) {
  const headerValue = req.headers.get("x-csrf-token");
  if (!headerValue) return false;
  const cookie = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!cookie) return false;
  return cookie === headerValue;
}
