'use client';

import { useEffect, useState } from 'react';
import type { SessionResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { PageSpinner } from '../components/PageSpinner';
import { ClientScreen } from '../components/ClientScreen';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await workshopApi.getSessions();
        setSessions(data);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <ClientScreen title="팀 컨퍼런스" subtitle="강릉 컨벤션 센터">
      {loading ? <PageSpinner label="세션 정보를 불러오는 중..." /> : null}
      {!loading ? (
      <div className="space-y-3 pb-4">
        {sessions.map((session) => (
          <article key={session.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4">
              <h3 className="text-sm font-bold text-slate-900">{session.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{session.description}</p>
              <p className="text-xs text-slate-500">{session.workshopTeamName ?? '미배정'} · {session.runningMinutes}분</p>
            </div>
            <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
              <button className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white" type="button">
                질문하기
              </button>
              <button className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700" type="button">
                피드백
              </button>
            </div>
          </article>
        ))}
      </div>
      ) : null}
    </ClientScreen>
  );
}
