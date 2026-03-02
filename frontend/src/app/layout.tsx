// root layout

import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gaya — Intelligence Platform',
  description: 'Discover coaches, camps, clinics, and private training near you. Powered by geospatial intelligence.',
  keywords: ['training', 'coaching', 'camps', 'clinics', 'soccer', 'sports', 'Toronto'],
  openGraph: {
    title: 'Gaya — Intelligence Platform',
    description: 'Find training near you. Discover talent everywhere.',
    siteName: 'Gaya',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-text-primary">
        <Providers>
          {children}
          <Toaster
            theme="light"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                color: '#0f172a',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
