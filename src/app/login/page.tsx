'use client';

import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HeaderPublic from '../components/headerPublic';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react'; // Importe o useEffect

const schema = z.object({
  email: z.string().email('Email inválido').nonempty('O campo email é obrigatório'),
  password: z.string().nonempty('O campo senha é obrigatório'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        alert(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao fazer login', error);
    }
  };

 
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-[#EF8D2A] h-screen antialiased">
      <header>
        <HeaderPublic />
      </header>

      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <form
          className="bg-white h-full max-w-lg w-full rounded-lg p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className="text-black text-3xl w-full flex justify-center items-center p-3 font-medium">
            Login
          </h1>

          <div className="mb-3">
            <h2 className="text-black font-medium mb-2">Email</h2>
            <input
              type="email"
              placeholder="Digite seu email"
              {...register('email')}
              className="w-full p-2 rounded-lg border-2 border-black"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email.message}</span>
            )}
          </div>

          <div className="mb-3">
            <h2 className="text-black font-medium mb-2">Senha</h2>
            <input
              type="password"
              placeholder="Digite sua senha"
              {...register('password')}
              className="w-full p-2 rounded-lg border-2 border-black"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">{errors.password.message}</span>
            )}
          </div>

          <div className="w-full flex justify-center items-center">
            <button
              type="submit"
              className="bg-[#EF8D2A] text-white rounded-lg p-2 px-5 mt-4 font-medium"
            >
              Enviar
            </button>
          </div>
        </form>

        <Link href="/register">
          <p className="text-white font-bold">Ainda não possui uma conta? Cadastre-se!</p>
        </Link>
      </div>
    </div>
  );
}