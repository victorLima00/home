import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'HOME - Organizador de Apartamento',
  description: 'Organize sua reforma e mobiliário com busca de promoções integrada',
  viewport: {
    width: 'device-width',
    initialScale: 1
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
