'use client'; // Marque o componente como Client Component

import { SessionProvider } from 'next-auth/react';

export default function Provider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}