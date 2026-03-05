'use client';

import { AppCard } from '@workshop/ui';
import { AdminScreen } from './components/AdminScreen';

export default function AdminHomePage() {
  return (
    <AdminScreen title="워크샵 운영 대시보드" subtitle="오늘 운영 현황">
      <section className="grid gap-4 md:grid-cols-2">
        <AppCard title="활성 미션" description="12개 진행중" />
        <AppCard title="예정 세션" description="8개 대기" />
        <AppCard title="참가자" description="150명 · 체크인 98%" />
        <AppCard title="공지" description="Broadcast 2건 발송됨" />
      </section>
    </AdminScreen>
  );
}
