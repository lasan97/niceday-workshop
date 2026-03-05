'use client';

import { AppCard } from '@workshop/ui';
import { AdminScreen } from '../components/AdminScreen';

export default function AdminUsersPage() {
  return (
    <AdminScreen title="사용자 관리" subtitle="팀/권한/계정">
      <div className="space-y-3">
        <AppCard title="전체 참가자" description="150명" />
        <AppCard title="팀 재배정" description="Team Alpha -> Team Beta 이동 요청 2건" />
        <AppCard title="권한 변경" description="운영 스태프 권한 3건" />
      </div>
    </AdminScreen>
  );
}
