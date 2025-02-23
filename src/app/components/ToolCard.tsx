"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface ToolCardProps {
  id: number;
  name: string;
  price: string;
  rating: number;
  image: string;
  description: string;
}

export default function ToolCard({
  id,
  name,
  price,
  rating,
  image,
  description,
}: ToolCardProps) {
  const router = useRouter();

  const handleClick = () => {
    console.log('ID:', id)
    router.push(`/tool/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      <Image
        width={256} 
        height={256} 
        src={image}
        alt={name}
        className="w-full h-64 object-contain"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold">{name}</h3>
        <p className="text-gray-700">{description}</p>
        <p className="text-gray-700 mt-2">{price}</p>
        <div className="flex items-center mt-2">
          <span className="text-yellow-500">
            {"★".repeat(Math.floor(rating))}
          </span>
          <span className="text-gray-400 ml-0">
            {"☆".repeat(5 - Math.floor(rating))}
          </span>
        </div>
      </div>
    </div>
  );
}
