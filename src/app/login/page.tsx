'use client';

import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HeaderPublic from '../components/headerPublic';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react'; 

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
    <div className="bg-[#EF8D2A] min-h-screen antialiased">
      <header>
        <HeaderPublic />
      </header>

      <div className="w-full min-h-screen flex flex-col justify-center items-center p-4">
        <form
          className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className="text-black text-2xl md:text-3xl w-full text-center font-medium mb-6">
            Login
          </h1>

          <div className="mb-4">
            <label className="text-black font-medium mb-2 block">Email</label>
            <input
              type="email"
              placeholder="Digite seu email"
              {...register('email')}
              className="w-full p-2 rounded-lg border-2 border-gray-300 focus:border-[#EF8D2A] focus:outline-none"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email.message}</span>
            )}
          </div>

          <div className="mb-6">
            <label className="text-black font-medium mb-2 block">Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              {...register('password')}
              className="w-full p-2 rounded-lg border-2 border-gray-300 focus:border-[#EF8D2A] focus:outline-none"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">{errors.password.message}</span>
            )}
          </div>

          <div className="w-full flex justify-center">
            <button
              type="submit"
              className="bg-[#EF8D2A] text-white rounded-lg py-2 px-6 font-medium hover:bg-[#cc7a24] transition-colors"
            >
              Enviar
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link href="/register">
            <p className="text-white font-bold hover:underline">
              Ainda não possui uma conta? Cadastre-se!
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}