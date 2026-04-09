import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function defaultUserData(email) {
  return {
    email: normalizeEmail(email),
    canvasUrl: null,
    canvasToken: null,
    xp: 0,
    streak: 0,
    egg_count: 0,
    subject: "science",
    subjectProgress: {},
    name: null,
    avatar_url: null,
    manualCourses: [],
  };
}

export async function getUserData(email) {
  const cleanEmail = normalizeEmail(email);
  const { data, error } = await supabase
    .from('user_connections')
    .select('*')
    .eq('email', cleanEmail)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Supabase Fetch Error:", error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    canvasUrl: data.canvas_url,
    canvasToken: data.canvas_token,
    xp: data.xp ?? 0,
    streak: data.streak ?? 0,
    egg_count: data.egg_count ?? 0,
    subject: data.subject ?? "science",
    subjectProgress: data.subject_progress ?? {},
    name: data.name ?? null,
    avatar_url: data.avatar_url ?? null,
    selectedCourseIds: data.selected_course_ids ?? null,
    courseEggs: data.course_eggs ?? {},
    manualCourses: data.manual_courses ?? [],
  };
}

export async function updateUserData(email, mutator) {
  const cleanEmail = normalizeEmail(email);

  let user = await getUserData(cleanEmail);
  if (!user) {
    user = defaultUserData(cleanEmail);
  }

  // Support legacy routes that nest data under user.progress
  if (!user.progress) {
    user.progress = {
      xp: user.xp ?? 0,
      streak: user.streak ?? 0,
      eggCount: user.egg_count ?? 0,
      subject: user.subject ?? "science",
      subjectProgress: user.subjectProgress ?? {},
    };
  }

  await mutator(user);

  // Merge progress back (support both flat and nested writes)
  const prog = user.progress ?? {};
  const xp = prog.xp ?? user.xp ?? 0;
  const streak = prog.streak ?? user.streak ?? 0;
  const eggCount = prog.eggCount ?? user.egg_count ?? 0;
  const subject = prog.subject ?? user.subject ?? "science";
  const subjectProgress = prog.subjectProgress ?? user.subjectProgress ?? {};

  const payload = {
    email: cleanEmail,
    canvas_url: user.canvasUrl ?? user.canvas_url ?? null,
    canvas_token: user.canvasToken ?? user.canvas_token ?? null,
    xp,
    streak,
    egg_count: eggCount,
    subject,
    subject_progress: subjectProgress,
    updated_at: new Date(),
    selected_course_ids: user.selectedCourseIds ?? null,
    course_eggs: user.courseEggs ?? {},
    manual_courses: user.manualCourses ?? [],
  };

  // Save name/avatar if present on the user object
  if (user.name) payload.name = user.name;
  if (user.avatar_url) payload.avatar_url = user.avatar_url;

  const { error } = await supabase
    .from('user_connections')
    .upsert(payload, { onConflict: 'email' });

  if (error) {
    console.error("Supabase Save Error:", error);
    throw new Error("Failed to save to Supabase");
  }
}

// Save user's Google profile (name + avatar) — called on sign-in/connect
export async function saveUserProfile(email, { name, avatar_url }) {
  const cleanEmail = normalizeEmail(email);
  const { error } = await supabase
    .from('user_connections')
    .upsert({ email: cleanEmail, name, avatar_url, updated_at: new Date() }, { onConflict: 'email' });

  if (error) console.error("Profile save error:", error);
}

export async function getFocusboardState(email) {
  const cleanEmail = normalizeEmail(email);
  const { data, error } = await supabase
    .from('user_connections')
    .select('course_order, creature_state')
    .eq('email', cleanEmail)
    .single();

  if (error || !data) return { courseOrder: null, creatureState: null };

  return {
    courseOrder: data.course_order ?? null,
    creatureState: data.creature_state ?? null,
  };
}

export async function saveFocusboardState(email, { courseOrder, creatureState }) {
  const cleanEmail = normalizeEmail(email);
  const { error } = await supabase
    .from('user_connections')
    .update({
      course_order: courseOrder ?? null,
      creature_state: creatureState ?? null,
      updated_at: new Date(),
    })
    .eq('email', cleanEmail);

  if (error) {
    console.error("FocusBoard Save Error:", error);
    throw new Error("Failed to save focusboard state");
  }
}
