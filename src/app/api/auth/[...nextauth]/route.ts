import NextAuth, { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import * as bcrypt from 'bcryptjs';

import { UserRepository } from '@/server/modules/users/repositories/user.repository';
import { AppDataSource } from '@/server/db/typeorm.datasource';

const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.phone || !credentials?.password) return null;

        if (!AppDataSource.isInitialized) await AppDataSource.initialize();
        const users = new UserRepository(AppDataSource);

        const raw = String(credentials.phone).trim();
        let phone = raw;
        if (/^0?9\d{9}$/.test(raw)) phone = '+98' + raw.replace(/^0/, '');
        if (/^0098\d{10}$/.test(raw)) phone = '+' + raw.slice(2);

        const user = await users.findByPhone(phone);
        if (!user) return null;

        const ok = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          phone: user.phone,
        };
      },
    }),
  ],
  pages: {
    // اگر صفحه‌ی اختصاصی لاگین داری، اینو ست کن
    // signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      // فیلدهای سفارشی به سشن
      (session as any).user = {
        id: token.id,
        name: session.user?.name,
        phone: (token as any).phone,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };