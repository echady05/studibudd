import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "studibudd-db.json");

let writeLock = Promise.resolve();

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function loadDb() {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("Bad db");
    return parsed;
  } catch {
    return { users: [], progressByUserId: {} };
  }
}

function withDbWriteLock(fn) {
  writeLock = writeLock.then(fn, fn);
  return writeLock;
}

async function saveDb(db) {
  await ensureDataDir();
  const tmp = `${DB_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_FILE);
}

export async function getDb() {
  return loadDb();
}

export async function writeDb(mutator) {
  return withDbWriteLock(async () => {
    const db = await loadDb();
    await mutator(db);
    await saveDb(db);
    return db;
  });
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

