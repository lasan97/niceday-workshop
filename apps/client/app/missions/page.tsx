'use client';

import { useEffect, useState } from 'react';
import type { MissionResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { ClientScreen } from '../components/ClientScreen';

const fallbackMissions: MissionResponse[] = [
  { id: 'mis-local-1', title: 'Gyeongpo Beach Snap', points: 200, active: true, pendingApprovals: 0 },
  { id: 'mis-local-2', title: 'Team Slogan Shout', points: 150, active: false, pendingApprovals: 0 },
  { id: 'mis-local-3', title: 'Local Delicacy Hunt', points: 300, active: true, pendingApprovals: 0 },
];

export default function MissionsPage() {
  const [missions, setMissions] = useState<MissionResponse[]>(fallbackMissions);

  useEffect(() => {
    async function load() {
      try {
        const data = await workshopApi.getMissions();
        setMissions(data);
      } catch {
        // API 연결 실패 시 fallback 데이터를 유지한다.
      }
    }

    void load();
  }, []);

  return (
    <ClientScreen title="Team Building Missions" subtitle="Current Leaderboard">
      <section className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-bold text-slate-900">1st Team Awesome · 1450 pts</p>
        <p className="mt-1 text-sm text-primary">2nd Nice Explorers (YOU) · 1200 pts</p>
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
                  Verify
                </button>
              ) : (
                <span className="rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white">DONE</span>
              )}
            </div>
          </article>
        ))}
      </section>
    </ClientScreen>
  );
}
