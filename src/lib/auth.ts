import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { getDS } from "@/lib/datasource";
import { User } from "@/entities/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        firstname: {
          label: "Firstname",
          type: "string",
        },
        surname: {
          label: "Surname",
          type: "string",
        },
        phone: {
          label: "Phone",
          type: "string",
        },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const ds = await getDS();
        const repo = ds.getRepository(User);
        const user = await repo.findOne({ where: { email: creds.email } });
        if (!user) return null;
        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          surname: user.surname,
          phone: user.phone,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
};
