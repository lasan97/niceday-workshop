'use client';

import { AppCard } from '@workshop/ui';
import { ClientScreen } from './components/ClientScreen';

export default function ClientHomePage() {
  return (
    <ClientScreen title="워크샵 홈" subtitle="Gangneung Workshop Day 1">
      <div className="space-y-3">
        <AppCard title="현재 세션" description="Beachside Relay Race · 진행중" />
        <AppCard title="팀 미션" description="강릉 포인트 스탬프 5개 모으기" />
        <AppCard title="빠른 이동" description="일정, 미션, 세션 페이지가 라우트로 연결되었습니다." />
      </div>
    </ClientScreen>
  );
}
