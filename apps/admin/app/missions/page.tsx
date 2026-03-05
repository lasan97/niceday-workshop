'use client';

import { AppCard } from '@workshop/ui';
import { AdminScreen } from '../components/AdminScreen';

export default function AdminMissionsPage() {
  return (
    <AdminScreen title="미션 관리" subtitle="콘텐츠/승인/점수">
      <div className="space-y-3">
        <AppCard title="신규 미션 생성" description="미션 제목/설명/배점 입력" />
        <AppCard title="대기중 제출" description="사진 인증 6건 승인 필요" />
      </div>
    </AdminScreen>
  );
}
