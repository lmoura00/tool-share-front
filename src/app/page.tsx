"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="bg-[#EF8D2A]  h-screen antialiased ">
      <header className="bg-black flex items-center justify-between ">
        <Image
          src="/assets/logo.png"
          alt=" "
          width={200}
          height={200}
          onClick={()=>{router.push('/')}}
          style={{
            paddingTop: "20px",
            paddingLeft: "30px",
            paddingBottom: "15px",
            alignItems: "center",
          }}
        />

        <div className="mr-10">
          <button
            className=" text-white font-bold bg-[#EF8D2A] p-1 mr-10 w-30 rounded"
            onClick={()=>{router.push('/login')}}
          >
            Entrar
          </button>
          <button 
            className=" text-white font-bold bg-[#EF8D2A] p-1 w-35 rounded"
            onClick={()=>{router.push('/register')}}
          >
            Cadastrar-se
          </button>
        </div>
      </header>

      <div className="flex  justify-between">
        <div className="mt-72 ml-20">
          <h1 className="text-[70px] font-bold ">
            {" "}
            <span className="block">Compartilhe</span> com{" "}
            <span className=" text-white ">ToolShare</span>
          </h1>
          <button className=" text-white bg-black rounded p-3 mr-10 w-30 font-bold " onClick={()=>router.push('/login')}>
            Entrar
          </button>
        </div>

        <div className=" h-auto max-w-full  ">
          <Image
            src="/assets/imagemHome.png"
            alt="Imagem da Home"
            width={800}
            height={600}
            className="h-auto max-w-full absolute right-0 bottom-0 object-cover"
            
          />
        </div>
      </div>
    </div>
  );
}
