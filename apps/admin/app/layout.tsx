import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '워크샵 관리자',
  description: '운영진 관리 대시보드',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
