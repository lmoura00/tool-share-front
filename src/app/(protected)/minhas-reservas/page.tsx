"use client";
import HeaderPrivate from "@/app/components/headerPrivate";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import { api } from "@/app/api";

interface Reservation {
  id: number;
  userId: number;
  toolId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pendente" | "confirmada" | "cancelada";
  createdAt: string;
  updatedAt: string;
  tool: {
    id: number;
    userId: number;
    name: string;
    description: string;
    price: number;
    category: string;
    rating: number;
    status: string;
    image: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function MinhasReservas() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"realizadas" | "recebidas">(
    "realizadas"
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchReservations();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router, activeTab, selectedCategory]); 

  const fetchReservations = async () => {
    try {
      let endpoint = `${api}/reservation`;
      if (activeTab === "recebidas") {
        endpoint = `${api}/reservation/received`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reservations");
      }

      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = (reservationId: number) => {
    console.log("Abrir chat para reserva:", reservationId);
  };

  const handleStatusChange = async (
    reservationId: number,
    newStatus: "pendente" | "confirmada" | "cancelada"
  ) => {
    try {
      const response = await fetch(
        `${api}/reservation/${reservationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update reservation status");
      }

      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: newStatus }
            : reservation
        )
      );
    } catch (error) {
      console.error("Error updating reservation status:", error);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const categories = [
    "Ferramentas Elétricas",
    "Ferramentas Manuais",
    "Medição e instrumentação",
    "Caixas Organizadoras",
    "Ferramentas para jardim",
    "Acessórios",
  ];

  const filteredReservations = selectedCategory
    ? reservations.filter(
        (reservation) => reservation.tool.category === selectedCategory
      )
    : reservations;

  const adjustTimezone = (dateString) => {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() / 60;
    date.setHours(date.getHours() - offset);
    return date;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header>
        <HeaderPrivate />
      </header>
      <div className="p-4 flex-grow">
        <h1 className="text-xl md:text-2xl font-bold">
          Bem vindo(a) a ToolShare, {session?.user?.name}!
        </h1>

        <div className="mt-10 mb-20 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          <div className="flex flex-col space-y-6 w-full md:w-64">
            <div className="bg-[#EAEAEA] p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Tipo de Reserva</h2>
              <div className="space-y-3">
                <button
                  className={`w-full px-4 py-2 rounded text-left ${
                    activeTab === "realizadas"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700"
                  }`}
                  onClick={() => setActiveTab("realizadas")}
                >
                  Reservas Realizadas
                </button>
                <button
                  className={`w-full px-4 py-2 rounded text-left ${
                    activeTab === "recebidas"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700"
                  }`}
                  onClick={() => setActiveTab("recebidas")}
                >
                  Reservas Recebidas
                </button>
              </div>
            </div>

            <div className="bg-[#EAEAEA] p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">
                Categoria de Ferramenta
              </h2>
              <div className="space-y-3">
                <button
                  className={`w-full px-4 py-2 rounded text-left ${
                    selectedCategory === null
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700"
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  Todas as Categorias
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`w-full px-4 py-2 rounded text-left ${
                      selectedCategory === category
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-grow">
            <div className="space-y-4">
              {filteredReservations.length === 0 ? (
                <div className="p-6 bg-white rounded-lg shadow-md text-center">
                  <p className="text-gray-600">
                    {activeTab === "realizadas"
                      ? "Nenhuma reserva realizada."
                      : "Nenhuma reserva recebida."}
                  </p>
                </div>
              ) : (
                filteredReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-6 bg-white rounded-lg shadow-md flex flex-col md:flex-row items-start"
                  >
                    <Image
                      width={250}
                      height={250}
                      src={reservation.tool.image}
                      alt={reservation.tool.name}
                      className="w-full md:w-24 h-24 object-cover rounded-lg mb-4 md:mb-0 md:mr-6"
                    />

                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {reservation.tool.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {reservation.tool.description}
                          </p>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              reservation.status === "confirmada"
                                ? "bg-green-500 text-white"
                                : reservation.status === "cancelada"
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-black"
                            }`}
                          >
                            {reservation.status}
                          </span>

                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => handleChat(reservation.id)}
                          >
                            Chat
                          </button>

                          {activeTab === "recebidas" &&
                            reservation.tool.userId === session?.user?.id && (
                              <select
                                value={reservation.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    reservation.id,
                                    e.target.value as
                                      | "pendente"
                                      | "confirmada"
                                      | "cancelada"
                                  )
                                }
                                className="px-4 py-2 border rounded"
                              >
                                <option value="pendente">Pendente</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="cancelada">Cancelada</option>
                              </select>
                            )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p>
                          <strong>Data Inicial:</strong>{" "}
                          {new Date(reservation.startDate).toLocaleString(
                            "pt-BR",
                            { timeZone: "UTC" }
                          )}
                        </p>
                        <p>
                          <strong>Data Final:</strong>{" "}
                          {new Date(reservation.endDate).toLocaleString(
                            "pt-BR",
                            { timeZone: "UTC" }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}