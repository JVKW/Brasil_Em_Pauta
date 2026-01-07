import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Lora, Playfair_Display } from 'next/font/google';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Brasil em Pauta',
  description: 'Um jogo de Governança em Pauta para um Brasil Ético',
};

const fontBody = Lora({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '700'],
});

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: '700',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", fontBody.variable, fontHeadline.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
