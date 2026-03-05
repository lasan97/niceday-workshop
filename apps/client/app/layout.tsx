import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '워크샵 클라이언트',
  description: '참가자용 워크샵 앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
