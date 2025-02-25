"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import HeaderPrivate from "@/app/components/headerPrivate";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import { api } from "@/app/api";

interface Tool {
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
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  image: string;
}

export default function ToolDetailsPage() {
  const params = useParams();
  const { id } = params;
  const { data: session } = useSession();

  const [tool, setTool] = useState<Tool | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [subTotal, setSubTotal] = useState<number>(0);

  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [rentStartDate, setRentStartDate] = useState<string>("");
  const [rentEndDate, setRentEndDate] = useState<string>("");
  const [rentSubTotal, setRentSubTotal] = useState<number>(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCategory, setEditCategory] = useState<string>("");
  const [editImage, setEditImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id && session?.accessToken) {
      fetchToolDetails();
    }
  }, [id, session]);

  const fetchToolDetails = async () => {
    try {
      const toolResponse = await fetch(`${api}/tool/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!toolResponse.ok) {
        throw new Error("Failed to fetch tool details");
      }

      const toolData = await toolResponse.json();
      setTool(toolData.tool);
      setEditName(toolData.tool.name);
      setEditDescription(toolData.tool.description);
      setEditPrice(toolData.tool.price);
      setEditCategory(toolData.tool.category);
      setEditImage(toolData.tool.image);

      const ownerResponse = await fetch(
        `${api}/user/${toolData.tool.userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (!ownerResponse.ok) {
        throw new Error("Failed to fetch owner details");
      }

      const ownerData = await ownerResponse.json();
      setOwner(ownerData);
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRental = () => {
    if (!startDate || !endDate || !tool) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      alert("A data final deve ser maior que a data inicial.");
      return;
    }

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const total = hours * tool.price;
    setSubTotal(total);
    setRentSubTotal(total);
  };

  const handleRentTool = async () => {
    if (!rentStartDate || !rentEndDate || !tool) return;

    const start = new Date(rentStartDate);
    const end = new Date(rentEndDate);

    if (end <= start) {
      alert("A data final deve ser maior que a data inicial.");
      return;
    }

    const startDateISO = new Date(
      start.getTime() - start.getTimezoneOffset() * 60000
    ).toISOString();
    const endDateISO = new Date(
      end.getTime() - end.getTimezoneOffset() * 60000
    ).toISOString();

    const payload = {
      tool_id: tool.id,
      start_date: startDateISO,
      end_date: endDateISO,
      status: "pendente",
    };

    try {
      const response = await fetch(`${api}/reservation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro do backend:", errorData);
        throw new Error("Failed to rent tool");
      }
      console.log(response);
      alert("Ferramenta alugada com sucesso!");
      setIsRentModalOpen(false);
    } catch (error) {
      console.error("Error renting tool:", error);
      alert("Erro ao alugar ferramenta.");
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        setEditImage(data.data.url);
      } else {
        alert("Erro ao fazer upload da imagem.");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload da imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const validateEditForm = () => {
    if (!editName || !editDescription || !editPrice || !editCategory) {
      alert("Todos os campos são obrigatórios.");
      return false;
    }
    if (editPrice <= 0) {
      alert("O preço deve ser maior que zero.");
      return false;
    }
    return true;
  };

  const handleEditTool = async () => {
    if (!validateEditForm()) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${api}/tool/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          price: editPrice,
          category: editCategory,
          image: editImage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update tool");
      }

      const updatedTool = await response.json();
      setTool(updatedTool);
      setIsEditModalOpen(false);
      alert("Ferramenta atualizada com sucesso!");
      await router.refresh();
    } catch (error) {
      console.error("Error updating tool:", error);
      alert(error.message || "Erro ao atualizar ferramenta.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTool = async () => {
    try {
      const response = await fetch(`${api}/tool/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete tool");
      }

      alert("Ferramenta excluída com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting tool:", error);
      alert("Erro ao excluir ferramenta.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!tool) {
    return <div className="text-center mt-10">Ferramenta não encontrada.</div>;
  }

  const isOwner = tool.userId === session?.user?.id;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header>
        <HeaderPrivate />
      </header>
      <div className="p-4 flex-grow">
        <h1 className="text-xl md:text-2xl font-bold mb-6">
          Detalhes da Ferramenta
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full h-64 mb-4">
            <Image
              height={250}
              width={250}
              src={tool ? tool.image : "/placeholder-image.jpg"}
              alt={tool ? tool.name : "Ferramenta"}
              className="w-full h-64 object-contain rounded-lg"
            />
          </div>
          <h2 className="text-xl font-bold">
            {tool ? tool.name : "Carregando..."}
          </h2>
          <p className="text-gray-700 mt-2">
            {tool ? tool.description : "Carregando..."}
          </p>
          <p className="text-gray-700 mt-2">
            Preço:{" "}
            <span className="font-bold">
              R${tool && tool.price ? tool.price.toFixed(2) : "0.00"}/h
            </span>
          </p>
          <p className="text-gray-700 mt-2">
            Categoria:{" "}
            <span className="font-bold">
              {tool ? tool.category : "Carregando..."}
            </span>
          </p>
          <div className="flex items-center mt-2">
            <span className="text-yellow-500">
              {"★".repeat(tool ? Math.floor(tool.rating) : 0)}
            </span>
            <span className="text-gray-400">
              {"☆".repeat(tool ? 5 - Math.floor(tool.rating) : 5)}
            </span>
          </div>

          <div className="mt-6 space-x-4">
            {isOwner ? (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-[#EF8D2A] text-white px-4 py-2 rounded-lg hover:bg-[#cc7a24]"
                >
                  Editar Ferramenta
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Excluir Ferramenta
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsCalculateModalOpen(true)}
                  className="bg-[#EF8D2A] text-white px-4 py-2 rounded-lg hover:bg-[#cc7a24]"
                >
                  Calcular Aluguel
                </button>
                <button
                  onClick={() => setIsRentModalOpen(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Alugar Ferramenta
                </button>
              </>
            )}
          </div>

          {!isOwner && owner && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Contato do Proprietário</h3>
              <div className="flex items-center mt-4">
                <Image
                  width={250}
                  height={250}
                  src={owner.image}
                  alt={owner.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <p className="text-gray-700">
                    <strong>Nome:</strong> {owner.name}
                  </p>
                  <p className="text-gray-700">
                    <strong>Telefone:</strong> {owner.phone}
                  </p>
                  <p className="text-gray-700">
                    <strong>Email:</strong> {owner.email}
                  </p>
                  <p className="text-gray-700">
                    <strong>Endereço:</strong> {owner.address}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Ferramenta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preço</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagem</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                  className="w-full p-2 border rounded-lg"
                />
                {isUploading && (
                  <p className="text-sm mt-2">Carregando imagem...</p>
                )}
                {editImage && (
                  <div className="mt-2 flex items-center justify-center">
                    <Image
                      src={editImage}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="w-24 h-24 object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditTool}
                className="bg-[#EF8D2A] text-white px-4 py-2 rounded-lg hover:bg-[#cc7a24]"
                disabled={isUpdating}
              >
                {isUpdating ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-700">
              Tem certeza que deseja excluir esta ferramenta?
            </p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTool}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {isCalculateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Calcular Aluguel</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data Inicial
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data Final
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sub Total
                </label>
                <input
                  type="text"
                  value={`R$${subTotal.toFixed(2)}`}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsCalculateModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleCalculateRental}
                className="bg-[#EF8D2A] text-white px-4 py-2 rounded-lg hover:bg-[#cc7a24]"
              >
                Calcular
              </button>
            </div>
          </div>
        </div>
      )}

      {isRentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Alugar Ferramenta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data Inicial
                </label>
                <input
                  type="datetime-local"
                  value={rentStartDate}
                  onChange={(e) => setRentStartDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data Final
                </label>
                <input
                  type="datetime-local"
                  value={rentEndDate}
                  onChange={(e) => setRentEndDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sub Total
                </label>
                <input
                  type="text"
                  value={`R$${rentSubTotal.toFixed(2)}`}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsRentModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleRentTool}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Solicitar Aluguel
              </button>
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
