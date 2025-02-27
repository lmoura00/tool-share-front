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
  status: "pendente" | "confirmada" | "cancelada" | "finalizada";
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

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
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

  const [users, setUsers] = useState<{ [key: number]: User }>({});

  // Estados para o modal de avaliação
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<
    number | null
  >(null);
  const [rating, setRating] = useState(0); // Avaliação de 0 a 5
  const [comment, setComment] = useState(""); // Comentário opcional

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchReservations();

      const intervalId = setInterval(fetchReservations, 1000);

      return () => clearInterval(intervalId);
    } else if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router, activeTab, selectedCategory]);

  const fetchReservations = async () => {
    try {
      let endpoint = `${api}/reservation`;
      if (activeTab === "recebidas") {
        endpoint = `${api}/reservations/received`;
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

      // Buscar informações dos usuários
      const userIds = data.map(
        (reservation: Reservation) => reservation.userId
      );
      const toolUserIds = data.map(
        (reservation: Reservation) => reservation.tool.userId
      );
      const uniqueUserIds = Array.from(new Set([...userIds, ...toolUserIds]));

      await fetchUsers(uniqueUserIds);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (userIds: number[]) => {
    try {
      const usersData: { [key: number]: User } = {};

      for (const userId of userIds) {
        const response = await fetch(`${api}/user/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user with ID ${userId}`);
        }

        const user = await response.json();
        usersData[userId] = user;
      }

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleStatusChange = async (
    reservationId: number,
    newStatus: "pendente" | "confirmada" | "cancelada" | "finalizada"
  ) => {
    try {
      const response = await fetch(
        `${api}/reservations/${reservationId}/status`,
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
        throw new Error("Falha ao atualizar o status da reserva");
      }

      const data = await response.json();
      console.log(data.message);
      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: newStatus }
            : reservation
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar o status da reserva:", error);
      alert("Erro ao atualizar o status da reserva");
    }
  };

  const handleDeleteReservation = async (reservationId: number) => {
    try {
      console.log("Excluindo reserva com ID:", reservationId);

      const response = await fetch(`${api}/reservation/${reservationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir a reserva");
      }

      // Atualiza a lista de reservas após a exclusão
      setReservations((prevReservations) =>
        prevReservations.filter(
          (reservation) => reservation.id !== reservationId
        )
      );

      console.log("Reserva excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir a reserva:", error);
      alert("Erro ao excluir a reserva");
    }
  };

  const handleSubmitRating = async () => {
    try {
      // Encontre a reserva selecionada
      const reservation = reservations.find(
        (r) => r.id === selectedReservationId
      );
      if (!reservation) {
        throw new Error("Reserva não encontrada");
      }

      // Verifique o token e o corpo da requisição
      console.log("Token:", session?.accessToken);
      console.log("Tool ID:", reservation.tool.id);
      console.log("Rating:", rating);

      const body = JSON.stringify({ rating: rating });
      console.log("Request Body:", body);

      // Envie a avaliação para o backend
      const response = await fetch(`${api}/tools/${reservation.tool.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: body,
      });

      if (!response.ok) {
        const errorData = await response.json(); // Captura a resposta de erro do backend
        console.error("Erro no backend:", errorData);
        throw new Error("Falha ao enviar a avaliação");
      }

      const data = await response.json();
      console.log(data.message);

      setIsRatingModalOpen(false);
      setRating(0);
      setComment("");
      setSelectedReservationId(null);

      // Atualizar a lista de reservas
      fetchReservations();
    } catch (error) {
      console.error("Erro ao enviar a avaliação:", error);
      alert("Erro ao enviar a avaliação");
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col mb-11">
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
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
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

                    <div className="flex-grow w-full">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="w-full md:w-2/3">
                          <h3 className="text-lg font-semibold">
                            {reservation.tool.name}
                          </h3>
                          <p className="text-sm text-gray-600 break-words whitespace-normal overflow-hidden overflow-ellipsis max-h-20">
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
                                : reservation.status === "finalizada"
                                ? "bg-purple-500 text-white"
                                : "bg-yellow-500 text-black"
                            }`}
                          >
                            {reservation.status}
                          </span>

                          {activeTab === "realizadas" &&
                            reservation.status !== "finalizada" &&
                            reservation.status !== "confirmada" && (
                              <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() =>
                                  handleDeleteReservation(reservation.id)
                                }
                              >
                                Excluir
                              </button>
                            )}

                          {activeTab === "realizadas" &&
                            reservation.status === "finalizada" && (
                              <button
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                onClick={() => {
                                  setSelectedReservationId(reservation.id);
                                  setIsRatingModalOpen(true);
                                }}
                              >
                                Avaliar Ferramenta
                              </button>
                            )}

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
                                      | "finalizada"
                                  )
                                }
                                className="px-4 py-2 border rounded"
                              >
                                <option value="pendente">Pendente</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="cancelada">Cancelada</option>
                                <option value="finalizada">Finalizada</option>
                              </select>
                            )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p>
                          <strong>Data Inicial:</strong>{" "}
                          {new Date(reservation.startDate).toLocaleString(
                            "pt-BR",
                            {
                              timeZone: "UTC",
                            }
                          )}
                        </p>
                        <p>
                          <strong>Data Final:</strong>{" "}
                          {new Date(reservation.endDate).toLocaleString(
                            "pt-BR",
                            {
                              timeZone: "UTC",
                            }
                          )}
                        </p>

                        {/* Exibir informações do dono da ferramenta (Reservas Realizadas) */}
                        {activeTab === "realizadas" &&
                          users[reservation.tool.userId] && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-lg">
                                Informações do Dono da Ferramenta:
                              </h4>
                              <p>
                                <strong>Nome:</strong>{" "}
                                {users[reservation.tool.userId].name}
                              </p>
                              <p>
                                <strong>Email:</strong>{" "}
                                {users[reservation.tool.userId].email}
                              </p>
                              <p>
                                <strong>Telefone:</strong>{" "}
                                {users[reservation.tool.userId].phone}
                              </p>
                            </div>
                          )}

                        {/* Exibir informações do usuário que está alugando (Reservas Recebidas) */}
                        {activeTab === "recebidas" &&
                          users[reservation.userId] && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-lg">
                                Informações do Locatário:
                              </h4>
                              <p>
                                <strong>Nome:</strong>{" "}
                                {users[reservation.userId].name}
                              </p>
                              <p>
                                <strong>Email:</strong>{" "}
                                {users[reservation.userId].email}
                              </p>
                              <p>
                                <strong>Telefone:</strong>{" "}
                                {users[reservation.userId].phone}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Avaliação */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Avaliar Ferramenta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nota (0 a 5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Comentário (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsRatingModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitRating}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Enviar Avaliação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}
