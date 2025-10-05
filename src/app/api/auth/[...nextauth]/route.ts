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

        let phone: string;
        try {
          phone = normalizePhoneToE164Iran(credentials.phone);
        } catch {
          return null;
        }

        const { getDataSource } = await import(
          "@/server/db/typeorm.datasource"
        );
        const ds = await getDataSource();
        const { User } = await import(
          "@/server/modules/users/entities/user.entity"
        );
        const repo = ds.getRepository(User);

        const user = await repo.findOne({ where: { phone } });
        if (!user) return null;

        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        // ⚠️ حتماً role و email را هم برگردان
        return {
          id: String(user.id),
          name: user.firstName ?? null,
          email: user.email ?? null, // اگر ندارید، می‌تونه null باشد
          phone: user.phone ?? null,
          role: (user as any).role ?? null, // enum/string
        } as any;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // بار اول لاگین: user ست می‌شود
      if (user) {
        token.id = (user as any).id; // ✅ استاندارد: token.id
        token.role = (user as any).role ?? null;
        token.email = (user as any).email ?? token.email ?? null;
        (token as any).phone =
          (user as any).phone ?? (token as any).phone ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id ?? null;
        (session.user as any).role = (token as any).role ?? null;
        session.user.email = (token as any).email ?? session.user.email ?? null;
        (session.user as any).phone = (token as any).phone ?? null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
