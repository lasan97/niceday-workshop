'use client';

import { AppCard } from '@workshop/ui';
import { AdminScreen } from '../components/AdminScreen';

export default function AdminSessionsPage() {
  return (
    <AdminScreen title="세션 관리" subtitle="발표/질문 모니터링">
      <div className="space-y-3">
        <AppCard title="세션 1" description="Room 101 · 질문 14개" />
        <AppCard title="세션 2" description="Room 102 · 질문 9개" />
        <AppCard title="세션 3" description="Room 201 · 피드백 23개" />
      </div>
    </AdminScreen>
  );
}
