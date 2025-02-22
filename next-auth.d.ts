import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    cpf?: string;
    type?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface Session {
    user?: User;
  }
}