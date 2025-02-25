import { api } from '@/app/api';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
      
        const res = await fetch(`${api}/session`, {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        });

        const user = await res.json();

        if (res.ok && user) {
         
          return {
            id: user.id,
            cpf: user.cpf,
            name: user.name,
            email: user.email,
            phone: user.phone,
            latitude: user.latitude,
            longitude: user.longitude,
            address: user.address,
            image: user.image,
            type: user.type,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            token: user.token, 
          };
        }
        return null; 
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
     
      if (user) {
        token.accessToken = user.token; 
        token.user = { 
          id: user.id,
          cpf: user.cpf,
          name: user.name,
          email: user.email,
          phone: user.phone,
          latitude: user.latitude,
          longitude: user.longitude,
          address: user.address,
          image: user.image,
          type: user.type,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
      return token;
    },
    async session({ session, token }) {
      
      session.accessToken = token.accessToken; 
      session.user = token.user; 
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET, 
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };