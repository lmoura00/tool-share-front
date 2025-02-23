"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";


const toolSchema = z.object({
  name: z.string().nonempty("O campo nome é obrigatório"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  price: z.number().min(0, "O preço deve ser maior ou igual a 0"),
  category: z.string().nonempty("O campo categoria é obrigatório"),
  status: z.enum(["disponível", "alugada", "em manutenção"]),
  image: z.string().optional(),
});

type ToolFormData = z.infer<typeof toolSchema>;

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ToolFormData) => void;
}

export default function AddToolModal({ isOpen, onClose, onSubmit }: AddToolModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
  });

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

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
        setImageUrl(data.data.url);
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

  const handleFormSubmit = (data: ToolFormData) => {
    onSubmit({ ...data, image: imageUrl || "" });
    reset();
    setImageUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Adicionar Nova Ferramenta</h2>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              {...register("name")}
              className="w-full p-2 border rounded-lg"
            />
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name.message}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              {...register("description")}
              className="w-full p-2 border rounded-lg"
            />
            {errors.description && (
              <span className="text-red-500 text-sm">{errors.description.message}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Preço (R$/h)</label>
            <input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className="w-full p-2 border rounded-lg"
            />
            {errors.price && (
              <span className="text-red-500 text-sm">{errors.price.message}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              {...register("category")}
              className="w-full p-2 border rounded-lg"
            >
              <option value="Ferramentas Elétricas">Ferramentas Elétricas</option>
              <option value="Ferramentas Manuais">Ferramentas Manuais</option>
              <option value="Medição e instrumentação">Medição e instrumentação</option>
              <option value="Caixas Organizadoras">Caixas Organizadoras</option>
              <option value="Ferramentas para jardim">Ferramentas para jardim</option>
              <option value="Acessórios">Acessórios</option>
            </select>
            {errors.category && (
              <span className="text-red-500 text-sm">{errors.category.message}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              {...register("status")}
              className="w-full p-2 border rounded-lg"
            >
              <option value="disponível">Disponível</option>
              <option value="alugada">Alugada</option>
              <option value="em manutenção">Em manutenção</option>
            </select>
            {errors.status && (
              <span className="text-red-500 text-sm">{errors.status.message}</span>
            )}
          </div>

          <div className="mb-4">
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
            {isUploading && <p className="text-sm mt-2">Carregando imagem...</p>}
            {imageUrl && (
              <div className="mt-2 flex items-center justify-center">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="w-24 h-24 object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#EF8D2A] text-white px-4 py-2 rounded-lg hover:bg-[#cc7a24]"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}