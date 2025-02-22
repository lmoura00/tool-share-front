'use client'; 
import HeaderPrivate from '@/app/components/headerPrivate';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>; 
  }

  if (!session) {
    redirect('/login'); 
  }

  const handleLogout = async () => {
    await signOut({ redirect: false }); 
    redirect('/login'); 
  };

  return (
    <div className="h-screen bg-gray-100">
      <header>
        <HeaderPrivate/>
      </header>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4">Welcome to your dashboard, {session.user?.email}!</p>

     
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}