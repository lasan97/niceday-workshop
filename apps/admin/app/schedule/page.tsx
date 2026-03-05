'use client';

import { AppCard } from '@workshop/ui';
import { AdminScreen } from '../components/AdminScreen';

export default function AdminSchedulePage() {
  return (
    <AdminScreen title="일정 관리" subtitle="워크샵 일정 편집">
      <div className="space-y-3">
        <AppCard title="Day 1" description="등록, 키노트, 팀 컨퍼런스, 디너" />
        <AppCard title="Day 2" description="팀 미션, 회고, 귀가" />
      </div>
    </AdminScreen>
  );
}
