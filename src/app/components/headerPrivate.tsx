import { FaBell } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeaderPrivate() {
  const router = useRouter()
  return (
    <div className="">
      <header className="bg-black flex items-center justify-between ">
        <Image
          src="/assets/logo.png"
          alt=" "
          width={200}
          height={200}
          onClick={()=>router.push('/')}
          style={{
            paddingTop: "20px",
            paddingLeft: "30px",
            paddingBottom: "15px",
            alignItems: "center",
          }}
        />

        <div className="mr-10">
          <button className=" text-white font-bold bg-[#EF8D2A] p-1 mr-10 w-30 rounded" >
            <FaBell />
          </button>

          <button className=" text-white font-bold bg-[#EF8D2A] p-1 w-35 rounded">
            Cadastrar-se
          </button>
        </div>
      </header>
    </div>
  );
}
