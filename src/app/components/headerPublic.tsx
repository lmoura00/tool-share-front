import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';

export default function HeaderPublic() {
  const router = useRouter()
  return (
    <div className="  ">
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


      </header>
    </div>
  );
}
