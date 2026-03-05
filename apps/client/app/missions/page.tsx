'use client';

import { AppCard } from '@workshop/ui';
import { ClientScreen } from '../components/ClientScreen';

const missions = [
  { title: '해변 인증샷', status: '진행중' },
  { title: '지역 음식 먹기', status: '진행중' },
  { title: '팀 구호 영상', status: '완료' },
];

export default function MissionsPage() {
  return (
    <ClientScreen title="팀 빌딩 미션" subtitle="실시간 랭킹과 미션 제출">
      <div className="space-y-3">
        <AppCard title="현재 팀 점수" description="Nice Explorers · 1,200pts · 2위" />
        {missions.map((mission) => (
          <AppCard
            key={mission.title}
            title={mission.title}
            description={`상태: ${mission.status}`}
            action={
              <button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white" type="button">
                인증 업로드
              </button>
            }
          />
        ))}
      </div>
    </ClientScreen>
  );
}
