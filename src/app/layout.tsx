import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { CanvasBackground } from '@/components/landing/CanvasBackground';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Velpro Telecom',
  description: 'Internet ultrarrápida para tudo que importa.',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        {/* Font links are handled by next/font now */}
      </head>
      <body className="font-body antialiased">
        <CanvasBackground />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
