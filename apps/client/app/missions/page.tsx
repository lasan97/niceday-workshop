'use client';

import { useEffect, useState } from 'react';
import type { MissionResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { PageSpinner } from '../components/PageSpinner';
import { ClientScreen } from '../components/ClientScreen';

export default function MissionsPage() {
  const [missions, setMissions] = useState<MissionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await workshopApi.getMissions();
        setMissions(data);
      } catch {
        setMissions([]);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <ClientScreen title="팀 빌딩 미션" subtitle="현재 리더보드">
      {loading ? <PageSpinner label="미션 정보를 불러오는 중..." /> : null}
      {!loading ? (
      <>
      <section className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-bold text-slate-900">1위 팀 어썸 · 1450점</p>
        <p className="mt-1 text-sm text-primary">2위 나이스 익스플로러(우리 팀) · 1200점</p>
      </section>

      <section className="space-y-3 pb-4">
        {missions.map((mission) => (
          <article
            key={mission.id}
            className={
              mission.active
                ? 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
                : 'rounded-xl border border-slate-200 bg-slate-100 p-4 opacity-70'
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{mission.title}</h3>
                <p className="mt-1 text-xs text-slate-500">보상 +{mission.points}</p>
              </div>
              {mission.active ? (
                <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white" type="button">
                  인증하기
                </button>
              ) : (
                <span className="rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white">완료</span>
              )}
            </div>
          </article>
        ))}
      </section>
      </>
      ) : null}
    </ClientScreen>
  );
}
