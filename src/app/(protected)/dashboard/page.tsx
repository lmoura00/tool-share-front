'use client'; // Marque o componente como Client Component

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>; // Exibe um carregamento enquanto verifica a sessão
  }

  if (!session) {
    redirect('/login'); // Redireciona para a página de login se não houver sessão
  }

  const handleLogout = async () => {
    await signOut({ redirect: false }); // Faz logout sem redirecionar automaticamente
    redirect('/login'); // Redireciona para a página de login após o logout
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4">Welcome to your dashboard, {session.user?.email}!</p>

      {/* Botão de Logout */}
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}