import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword } from "./auth";
import { normalizeEmail } from "./db";
import { getRateLimitKey, assertNotRateLimited } from "./rateLimit";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is required");
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/** @type {import("next-auth").AuthOptions} */
export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const key = getRateLimitKey(req);
        assertNotRateLimited(`login:${key}`, 5, 15 * 60 * 1000);

        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        const email = normalizeEmail(credentials.email);
        const { data, error } = await supabase
          .from("user_connections")
          .select("email, password_hash, name, avatar_url")
          .eq("email", email)
          .single();

        if (error || !data || !data.password_hash) {
          throw new Error("Invalid email or password");
        }

        const validPassword = await verifyPassword(credentials.password, data.password_hash);
        if (!validPassword) {
          throw new Error("Invalid email or password");
        }

        return {
          id: email,
          email,
          name: data.name ?? undefined,
          image: data.avatar_url ?? undefined,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
