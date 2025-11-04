import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic rendering and prevent caching
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// CRITICAL for Vercel: Enable trustHost to handle preview/production domains
const handler = NextAuth({
  ...authOptions,
  trustHost: true,
} as AuthOptions & { trustHost: boolean });

export { handler as GET, handler as POST };

