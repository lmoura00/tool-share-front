"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import HeaderPublic from "../components/headerPublic";
import { useState, useRef } from "react";
import {
  useLoadScript,
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import Image from "next/image";
import { api } from "../api";

const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatório").min(4, "O tamanho minimo de nome é de 4 caracteres"),
  email: z
    .string()
    .email("Email inválido")
    .nonempty("O campo email é obrigatório"),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .nonempty("O campo senha é obrigatório"),
  phone: z.string().nonempty("O campo telefone é obrigatório"),
  cpf: z.string().nonempty("O campo CPF é obrigatório"),
  address: z.string().nonempty("O campo endereço é obrigatório"),
  latitude: z.string().nonempty(),
  longitude: z.string().nonempty(),
  image: z.string().nonempty("Uma foto é necessária para personalização"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const LIBRARIES: ("places" | "drawing" | "geometry" | "visualization")[] = [
    "places",
  ];

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

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
        setValue("image", data.data.url);
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

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      const address = place.formatted_address || "";
      setValue("address", address);

      const location = place.geometry?.location;
      if (location) {
        const lat = location.lat();
        const lng = location.lng();
        setLatitude(lat);
        setLongitude(lng);
        setValue("latitude", lat.toString());
        setValue("longitude", lng.toString());

        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
        }
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const userData = {
        ...data,
        latitude: latitude?.toString() || null,
        longitude: longitude?.toString() || null,
      };

      const response = await fetch(`${api}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        router.push("/login");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao registrar usuário");
      }
    } catch (error) {
      console.error("Erro ao fazer registro", error);
    }
  };

  if (!isLoaded) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="bg-[#EF8D2A] min-h-screen">
      <header>
        <HeaderPublic />
      </header>
      <div className="bg-[#EF8D2A] pt-7 pb-10 min-h-screen flex flex-col items-center">
        <div className="w-full max-w-lg flex-1 flex flex-col justify-center">
          <form
            className="bg-white rounded-lg p-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h1 className="text-black text-3xl w-full flex justify-center items-center p-3 mb-2 font-medium">
              Cadastro
            </h1>

            <div className="mb-3">
              <h2 className="text-black font-medium mb-2">Nome</h2>
              <input
                type="text"
                placeholder="Digite seu nome completo"
                {...register("name")}
                className="w-full p-2 rounded-lg border-2 border-black"
              />
              {errors.name && (
                <span className="text-red-500 text-sm">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="mb-3">
              <h2 className="text-black font-medium mb-2">Email</h2>
              <input
                type="email"
                placeholder="Digite seu email"
                {...register("email")}
                className="w-full p-2 rounded-lg border-2 border-black"
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="mb-3">
              <h2 className="text-black font-medium mb-2">Senha</h2>
              <input
                type="password"
                placeholder="Digite sua senha"
                {...register("password")}
                className="w-full p-2 rounded-lg border-2 border-black"
              />
              {errors.password && (
                <span className="text-red-500 text-sm">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="mb-3">
              <h2 className="text-black font-medium mb-2">Telefone</h2>
              <input
                type="text"
                maxLength={11}
                placeholder="Digite seu telefone"
                {...register("phone")}
                className="w-full p-2 rounded-lg border-2 border-black"
              />
              {errors.phone && (
                <span className="text-red-500 text-sm">
                  {errors.phone.message}
                </span>
              )}
            </div>

            <div className="mb-3">
              <h2 className="text-black font-medium mb-2">CPF</h2>
              <input
                type="text"
                placeholder="Digite seu CPF"
                {...register("cpf")}
                maxLength={11}
                className="w-full p-2 rounded-lg border-2 border-black"
              />
              {errors.cpf && (
                <span className="text-red-500 text-sm">
                  {errors.cpf.message}
                </span>
              )}
            </div>

            <div className="mb-3">
              <h2 className="text-black font-medium mb-2">Endereço</h2>
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={onPlaceChanged}
                options={{
                  types: ["establishment", "geocode"],
                  componentRestrictions: { country: "br" },
                }}
              >
                <input
                  type="text"
                  placeholder="Digite um local ou endereço"
                  {...register("address")}
                  className="w-full p-2 rounded-lg border-2 border-black"
                />
              </Autocomplete>
              {errors.address && (
                <span className="text-red-500 text-sm">
                  {errors.address.message}
                </span>
              )}
            </div>

            <div className="mb-3">
              <h2 className="text-black font-medium mb-2">Mapa</h2>
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={{
                    lat: latitude || -5.111502004315972,
                    lng: longitude || -42.85387871534339,
                  }}
                  zoom={15}
                  onLoad={(map) => {
                    mapRef.current = map;
                  }}
                >
                  {latitude && longitude && (
                    <Marker position={{ lat: latitude, lng: longitude }} />
                  )}
                </GoogleMap>
              </div>
            </div>

            <div className="mb-3">
              <h2 className="text-black font-medium mb-2">Foto de Perfil</h2>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0]);
                  }
                }}
                className="w-full p-2 rounded-lg border-2 border-black"
              />
              {isUploading && (
                <p className="text-sm mt-2">Carregando imagem...</p>
              )}
              {imageUrl && (
                <div className="flex mt-2 items-center justify-center">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    width={50}
                    height={50}
                    className="w-50 h-50 rounded-full object-cover"
                  />
                </div>
              )}
              {errors.image && (
                <span className="text-red-500 text-sm">
                  {errors.image.message}
                </span>
              )}
            </div>

            <div className="w-full flex justify-center items-center">
              <button
                type="submit"
                className="bg-[#EF8D2A] text-white rounded-lg p-2 px-5 mt-4 font-medium"
              >
                Cadastrar
              </button>
            </div>
          </form>
        </div>

        <div className="w-full max-w-lg mt-6 text-center">
          <Link href="/login">
            <p className="text-white font-bold">
              Já possui uma conta? Faça o login!
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
