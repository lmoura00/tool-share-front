"use client";
import HeaderPrivate from "@/app/components/headerPrivate";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }
  console.log(session.user?.image)
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <div className="h-screen bg-gray-100">
      <header>
        <HeaderPrivate />
      </header>
      <h1 className="text-xl md:text-2xl font-bold p-4">Dashboard</h1>
      <p className="mt-2 md:mt-4 p-4">
        Bem vindo ao seu dashboard, {session.user?.email}!
      </p>

      <div className="p-4">
        <h1>Bem vindo, {session.user?.name}!</h1>
        <p>Email: {session.user?.email}</p>
        <p>CPF: {session.user?.cpf}</p>
        <p>Type: {session.user?.type}</p>
        <p>
          Account Created:{" "}
          {session.user?.createdAt
            ? new Date(session.user.createdAt).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-4 ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
            clipRule="evenodd"
          />
        </svg>
        Logout
      </button>
    </div>
  );
}