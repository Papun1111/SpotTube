import { prismaClient } from "@/lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }
      try {
        await prismaClient.user.upsert({
          where: { email: user.email },
          update: {}, // No update needed; we just want to ensure the user exists
          create: {
            email: user.email,
            provider: "Google"
          }
        });
      } catch (e) {
        console.error("Error in signIn callback:", e);
        return false;
      }
      return true;
    }
  }
});

export { handler as GET, handler as POST };
