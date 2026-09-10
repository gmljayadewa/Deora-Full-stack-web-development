import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import Layout from '../components/Layout';

export const metadata: Metadata = {
  title: 'Deora | Savour The Goodness',
  description: 'Natural wellness, herbal and food products for a healthy and happy life.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}