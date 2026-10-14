import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

import { prisma } from "@/lib/prisma"
import { findAvailableUsername } from "@/services/profiles"

const prismaAdapter = PrismaAdapter(prisma)

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...prismaAdapter,
    // Username é único e editável nas configurações: se alguém já adotou o login do
    // GitHub deste novo usuário, ele recebe uma variação livre (login-2...) em vez de
    // o cadastro falhar.
    async createUser(user) {
      const username = user.username ? await findAvailableUsername(user.username) : null
      return prismaAdapter.createUser!({ ...user, username })
    },
  },
  // Sessões guardadas no banco: podem ser revogadas apagando a linha em Session.
  session: { strategy: "database" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      // Login do GitHub como username inicial do DevShelf (ver createUser acima).
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login.toLowerCase(),
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      session.user.username = user.username ?? null
      return session
    },
  },
})
