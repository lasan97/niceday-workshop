import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Workshop Client',
  description: '참가자용 워크샵 앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
