import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteDescription =
  'DeVis.AI is your intelligent AI personal assistant for smarter conversations, productivity, automation, and everyday tasks — all in one place.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'DeVis.AI — Intelligent AI Personal Assistant',
  description: siteDescription,
  icons: {
    icon: [
      { url: '/devis.png' },
      { url: '/icon.png' },
    ],
    shortcut: '/devis.png',
    apple: '/devis.png',
  },
  openGraph: {
    title: 'DeVis.AI — Intelligent AI Personal Assistant',
    description: siteDescription,
    url: '/',
    siteName: 'DeVis.AI',
    images: [
      {
        url: '/devis_og.png',
        width: 1200,
        height: 630,
        alt: 'DeVis.AI — Intelligent AI Personal Assistant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeVis.AI — Intelligent AI Personal Assistant',
    description: siteDescription,
    images: ['/devis_og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground selection:bg-primary/20 selection:text-primary`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
