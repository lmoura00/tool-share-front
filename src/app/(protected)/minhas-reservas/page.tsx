"use client";
import HeaderPrivate from "@/app/components/headerPrivate";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ToolCard from "@/app/components/ToolCard";
import { useEffect, useState } from "react";
import Footer from "@/app/components/Footer";

interface Tool {
  id: number;
  userId: number;
  renterId?: number; 
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  status: string;
}

export default function MinhasReservas() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTools();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchTools = async () => {
    try {
      const response = await fetch("http://localhost:3333/tool", {
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
      console.log(data.tools);
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header>
        <HeaderPrivate />
      </header>
      <div className="p-4 flex-grow">
        <h1 className="text-xl md:text-2xl font-bold">
          Bem vindo(a) a ToolShare, {session?.user?.name}!
        </h1>

        <div className="mt-10 mb-20">
          <h2 className="text-lg md:text-xl font-semibold">Ferramentas que Aluguei</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-4">
            {tools
              .filter(
                (tool) =>
                  tool.status === "alugada" && tool.renterId === session?.user?.id 
              )
              .map((tool) => (
                <ToolCard
                  key={tool.id}
                  name={tool.name}
                  price={`R$${tool.price.toFixed(2)}/h`}
                  rating={tool.rating}
                  image={tool.image}
                  description={tool.description}
                />
              ))}
          </div>
        </div>
      </div>

      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}