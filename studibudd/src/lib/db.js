import { createClient } from '@supabase/supabase-js';

// These must be set in your Vercel/Netlify Environment Variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/**
 * Default data structure for a new user
 */
function defaultUserData(email) {
  return {
    email: normalizeEmail(email),
    canvas_url: null,
    canvas_token: null,
    xp: 0,
    streak: 0,
    egg_count: 0,
    subject: "science",
    science_progress: 0,
    math_progress: 0,
    main_progress: 0
  };
}

/**
 * Fetches user data from Supabase
 */
export async function getUserData(email) {
  const cleanEmail = normalizeEmail(email);
  const { data, error } = await supabase
    .from('user_connections')
    .select('*')
    .eq('email', cleanEmail)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error("Supabase Fetch Error:", error);
    return null;
  }

  // Map database snake_case back to your app's camelCase if needed,
  // or just return the data object.
  if (data) {
    return {
      ...data,
      canvasUrl: data.canvas_url,
      canvasToken: data.canvas_token
    };
  }
  
  return null;
}

/**
 * Updates user data in Supabase
 */
export async function updateUserData(email, mutator) {
  const cleanEmail = normalizeEmail(email);
  
  // 1. Get current data or create default
  let user = await getUserData(cleanEmail);
  if (!user) {
    user = defaultUserData(cleanEmail);
  }

  // 2. Run the mutator from your connect route
  // The mutator will set user.canvasUrl and user.canvasToken
  await mutator(user);

  // 3. Prepare data for Supabase (mapping camelCase to snake_case)
  const payload = {
    email: cleanEmail,
    canvas_url: user.canvasUrl,
    canvas_token: user.canvasToken,
    xp: user.xp || 0,
    streak: user.streak || 0,
    egg_count: user.egg_count || 0,
    subject: user.subject || "science",
    updated_at: new Date()
  };

  // 4. Save to Database
  const { error } = await supabase
    .from('user_connections')
    .upsert(payload, { onConflict: 'email' });

  if (error) {
    console.error("Supabase Save Error:", error);
    throw new Error("Failed to save to Supabase database");
  }
}