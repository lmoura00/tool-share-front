import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Provider from '../providers/SessionProvider'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  icons: '/assets/logoIcon.png',
  title: 'ToolShare',
  description: 'Um app incrível!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>{children}</Provider> 
      </body>
    </html>
  );
}