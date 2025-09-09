import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
export const runtime = "nodejs";

function normalizePhoneToE164Iran(input: string): string {
  const v = String(input).trim();
  if (/^\+98\d{10}$/.test(v)) return v;
  if (/^0098\d{10}$/.test(v)) return "+" + v.slice(2);
  if (/^0?9\d{9}$/.test(v)) return "+98" + v.replace(/^0/, "");
  throw new Error("Invalid Iranian phone");
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  providers: [
    Credentials({
      name: "Phone & Password",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        // نرمال‌سازی امن‌تر
        let phone: string;
        try {
          phone = normalizePhoneToE164Iran(credentials.phone);
        } catch {
          return null;
        }

        const { getDataSource } = await import("@/server/db/typeorm.datasource");
        const ds = await getDataSource();
        const { User } = await import("@/server/modules/users/entities/user.entity");
        const repo = ds.getRepository(User);

        const user = await repo.findOne({ where: { phone } });
        if (!user) return null;

        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        return { id: String(user.id), name: user.firstName, phone: user.phone } as any;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.uid) (session.user as any).id = token.uid as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };