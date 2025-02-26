"use client";
import HeaderPrivate from "@/app/components/headerPrivate";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ToolCard from "@/app/components/ToolCard";
import { useEffect, useState } from "react";
import Footer from "@/app/components/Footer";
import { api } from "@/app/api";

interface Tool {
  id: number;
  userId: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  status: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTools(); // Fetch tools immediately on component mount

      const intervalId = setInterval(fetchTools, 1000); // Fetch tools every 1 second

      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, session?.accessToken]); // Add session?.accessToken to dependency array

  const fetchTools = async () => {
    try {
      const response = await fetch(`${api}/tool`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tools");
      }

      const data = await response.json();
      setTools(data.tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const availableTools = tools.filter(
    (tool) => tool.status === "disponível" && tool.userId !== session?.user?.id
  );
  const rentedTools = tools.filter((tool) => tool.status === "alugada");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header>
        <HeaderPrivate />
      </header>
      <div className="p-4 flex-grow">
        <h1 className="text-xl md:text-2xl font-bold">
          Bem vindo(a) a ToolShare, {session?.user?.name}!
        </h1>

        <div className="mt-6">
          <h2 className="text-lg md:text-xl font-semibold">
            Ferramentas Disponíveis
          </h2>
          {availableTools.length === 0 ? (
            <p className="text-gray-600 mt-4">Nenhuma ferramenta disponível.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-4">
              {availableTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  id={tool.id}
                  name={tool.name}
                  price={`R$${tool.price.toFixed(2)}/h`}
                  rating={tool.rating}
                  image={tool.image}
                  description={tool.description}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 mb-20">
          <h2 className="text-lg md:text-xl font-semibold">
            Ferramentas Alugadas
          </h2>
          {rentedTools.length === 0 ? (
            <p className="text-gray-600 mt-4">Nenhuma ferramenta alugada.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-4">
              {rentedTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  id={tool.id}
                  name={tool.name}
                  price={`R$${tool.price.toFixed(2)}/h`}
                  rating={tool.rating}
                  image={tool.image}
                  description={tool.description}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}