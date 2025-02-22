import { FaBell, FaSearch } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function HeaderPrivate() {
  const router = useRouter();
  const { data: session } = useSession(); 

  return (
    <div>
      <header className="bg-black flex items-center justify-between p-4">
   
        <Image
          src="/assets/logo.png"
          alt="Logo"
          width={150}
          height={50}
          onClick={() => router.push('/')}
          className="cursor-pointer"
          style={{
            paddingLeft: "30px",
          }}
        />

        <div className="flex items-center rounded w-1/3">
          <input
            type="text"
            placeholder="Pesquisar ferramenta..."
            className="w-full px-4 py-2 rounded-l focus:outline-none outline-none"
          />
          <button className="bg-[#EF8D2A] text-white p-3 rounded-r hover:bg-[#cc7a24] transition-colors">
            <FaSearch />
          </button>
        </div>


        <div className="flex items-center space-x-4 mr-10">

          <button className="text-white font-bold bg-[#EF8D2A] p-3 rounded-full hover:bg-[#cc7a24] transition-colors">
            <FaBell />
          </button>

          {session?.user?.image && (
            <button
              onClick={() => router.push('/profile')} 
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#EF8D2A]"
            >
              <Image
                src={session.user.image}
                alt="Foto de perfil"
                width={40}
                height={40}
                className="object-cover"
              />
            </button>
          )}
        </div>
      </header>
    </div>
  );
}