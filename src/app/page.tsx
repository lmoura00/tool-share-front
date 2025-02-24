"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="bg-[#EF8D2A] min-h-screen antialiased">
      <header className="bg-black flex items-center justify-between p-4 md:p-6">
        <Image
          src="/assets/logo.png"
          alt="Logo"
          width={150}
          height={150}
          onClick={() => router.push("/")}
          className="cursor-pointer"
          style={{
            paddingTop: "1rem",
            paddingLeft: "1.5rem",
            paddingBottom: "0.75rem",
          }}
        />

        <div className="flex space-x-4">
          <button
            className="text-white font-bold bg-[#EF8D2A] px-4 py-2 rounded hover:bg-[#cc7a24] transition-colors"
            onClick={() => router.push("/login")}
          >
            Entrar
          </button>
          <button
            className="text-white font-bold bg-[#EF8D2A] px-4 py-2 rounded hover:bg-[#cc7a24] transition-colors"
            onClick={() => router.push("/register")}
          >
            Cadastrar-se
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center p-4 md:p-8">
        <div className="text-center md:text-left mt-10 md:mt-0 md:ml-20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
            <span className="block">Compartilhe</span> com{" "}
            <span className="text-white">ToolShare</span>
          </h1>
          <button
            className="text-white bg-black rounded px-6 py-3 mt-6 font-bold hover:bg-gray-800 transition-colors"
            onClick={() => router.push("/login")}
          >
            Entrar
          </button>
        </div>

        <div className="mt-10 md:mt-0">
          <Image
            src="/assets/imagemHome.png"
            alt="Imagem da Home"
            width={720}
            height={329}
            className="w-full h-auto max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg absolute right-0 bottom-0"
            layout="responsive"
          />
        </div>
      </div>
    </div>
  );
}
