import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 w-full">
      <footer className="bg-black flex items-center justify-center">
        <Image
          src="/assets/logo.png"
          alt="Logo"
          width={150}
          height={150}
          onClick={() => router.push('/')}
          className="cursor-pointer"
          style={{
            paddingTop: "15px",
            paddingLeft: "30px",
            paddingBottom: "15px",
          }}
        />
      </footer>
    </div>
  );
}