import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from "node:fs/promises";
import path from "node:path";

const DB_FILE = path.join(process.cwd(), "data", "studibudd-db.json");

async function loadDb() {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : { byEmail: {} };
  } catch {
    return { byEmail: {} };
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const db = await loadDb();
  const entries = Object.entries(db.byEmail || {});

  const board = entries
    .map(([email, user]) => {
      const prog = user.progress ?? {};
      const xp = prog.xp ?? 0;
      const level = Math.floor(xp / 120) + 1;
      return {
        name: user.name || email.split("@")[0],
        image: user.image || null,
        xp,
        level,
        eggCount: prog.eggCount ?? 0,
        streak: prog.streak ?? 0,
        isYou: email.toLowerCase() === session.user.email.toLowerCase(),
      };
    })
    .filter(e => e.name)
    .sort((a, b) => b.xp - a.xp);

  return NextResponse.json({ board });
}
