import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_connections')
    .select('email, name, avatar_url, xp, streak, egg_count')
    .order('xp', { ascending: false });

  if (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json({ error: "Could not load leaderboard" }, { status: 500 });
  }

  const board = (data || []).map(row => {
    const xp = row.xp ?? 0;
    const level = Math.floor(xp / 120) + 1;
    const displayName = row.name || row.email.split("@")[0];
    return {
      name: displayName,
      image: row.avatar_url || null,
      xp,
      level,
      eggCount: row.egg_count ?? 0,
      streak: row.streak ?? 0,
      isYou: row.email.toLowerCase() === session.user.email.toLowerCase(),
    };
  });

  return NextResponse.json({ board });
}
