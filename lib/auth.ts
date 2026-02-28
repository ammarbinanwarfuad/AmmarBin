import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import User from "@/models/User";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[AUTH] Missing credentials");
            throw new Error("Invalid credentials");
          }

          // Rate limiting check (Note: In-memory, resets on serverless restart)
          const rateLimitResult = checkRateLimit(credentials.email, {
            maxAttempts: 5,
            windowMs: 15 * 60 * 1000, // 15 minutes
            lockoutDurationMs: 5 * 60 * 1000, // 5 minutes (reduced for serverless)
          });

          if (!rateLimitResult.allowed) {
            const lockedUntil = rateLimitResult.lockedUntil;
            const minutes = lockedUntil
              ? Math.ceil((lockedUntil.getTime() - Date.now()) / 60000)
              : 5;
            console.error(`[AUTH] Rate limit exceeded for ${credentials.email}`);
            throw new Error(
              `Too many login attempts. Account locked for ${minutes} minutes.`
            );
          }

          // Database connection with error handling
          try {
            await connectDB();
          } catch (dbError) {
            const errorMsg = dbError instanceof Error ? dbError.message : 'Unknown error';
            console.error("[AUTH] Database connection failed:", errorMsg);
            
            // Provide user-friendly error message
            if (errorMsg.includes('network') || errorMsg.includes('reach')) {
              throw new Error("Unable to connect to database. Please try again in a moment.");
            } else if (errorMsg.includes('authentication') || errorMsg.includes('credentials')) {
              throw new Error("Database configuration error. Please contact support.");
            }
            
            throw new Error("Database connection failed. Please try again.");
          }

          const user = await User.findOne({ email: credentials.email });

          if (!user || !user.password) {
            console.error(`[AUTH] User not found: ${credentials.email}`);
            throw new Error("Invalid credentials");
          }

          // Check if account is locked
          if (user.lockUntil && user.lockUntil > new Date()) {
            const minutes = Math.ceil(
              (user.lockUntil.getTime() - Date.now()) / 60000
            );
            console.error(`[AUTH] Account locked: ${credentials.email}`);
            throw new Error(
              `Account is locked due to multiple failed login attempts. Try again in ${minutes} minutes.`
            );
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isCorrectPassword) {
            // Increment login attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            // Lock account if max attempts reached
            if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
              user.lockUntil = new Date(Date.now() + LOCK_TIME);
            }

            await user.save();
            console.error(`[AUTH] Invalid password for: ${credentials.email}`);
            throw new Error("Invalid credentials");
          }

          // Successful login - reset attempts and update login info
          user.loginAttempts = 0;
          user.lockUntil = undefined;
          user.lastLogin = new Date();
          
          // Get IP address from request headers
          const forwarded = (req as { headers?: Record<string, string | string[] | undefined> })?.headers?.["x-forwarded-for"];
          const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(",")[0] : (req as { headers?: Record<string, string | string[] | undefined> })?.headers?.["x-real-ip"];
          user.lastLoginIp = (typeof ip === "string" ? ip : ip?.[0]) || "unknown";

          await user.save();

          // Reset rate limit on successful login
          resetRateLimit(credentials.email);

          console.log(`[AUTH] Successful login: ${credentials.email}`);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            role: user.role,
          };
        } catch (error) {
          // Log all errors for debugging in Vercel
          console.error("[AUTH] Authorization error:", error);
          // Re-throw to let NextAuth handle it
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as { id?: string }).id = token.id as string | undefined;
        (session.user as { role?: string }).role = token.role as string | undefined;
        (session.user as { email?: string }).email = token.email as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours
    updateAge: 30 * 60, // Update session every 30 minutes
  },
  cookies: {
    sessionToken: {
      // Use __Secure- prefix in production to be consistent with useSecureCookies
      // and to ensure getToken() looks for the same cookie it sets.
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  // useSecureCookies is now handled consistently via the explicit cookie name above.
  // Setting it separately caused a mismatch: cookie was SET as next-auth.session-token
  // but getToken() looked for __Secure-next-auth.session-token in production.
  secret: process.env.NEXTAUTH_SECRET,
} as NextAuthOptions;

