import Image from "next/image";
import React from "react";

interface ToolCardProps {
  name: string;
  price: string;
  rating: number;
  image: string;
  description: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ name, price, rating, image, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <Image
        src={image}
        alt={name}
        width={100}
        height={100}
        className="w-full h-48 object-contain rounded-t-lg"
      />
      <div className="mt-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-gray-600">{price}</p>
        <div className="flex items-center mt-2">
          <span className="text-yellow-500">{"★".repeat(Math.floor(rating))}</span>
          <span className="text-gray-400 ml-1">{"☆".repeat(5 - Math.floor(rating))}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      </div>
    </div>
  );
};

export default ToolCard;