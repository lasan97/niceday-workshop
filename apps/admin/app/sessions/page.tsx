'use client';

import { useEffect, useState } from 'react';
import type { SessionResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';

const fallbackSessions: SessionResponse[] = [
  {
    id: 'ses-local-1',
    team: '알파팀',
    title: '업무 환경에서의 AI 미래',
    speaker: '제인 도',
    room: '그랜드홀 A',
    liveQa: true,
    pendingQuestions: 5,
  },
];

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>(fallbackSessions);

  useEffect(() => {
    async function load() {
      try {
        const data = await workshopApi.getSessions();
        setSessions(data);
      } catch {
        // API 연결 실패 시 fallback 데이터를 유지한다.
      }
    }

    void load();
  }, []);

  return (
    <AdminScreen
      title="세션 관리"
      subtitle="컨퍼런스 발표 관리"
      action={<button className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white">+ 추가</button>}
    >
      <div className="space-y-3">
        {sessions.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <span className="rounded bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{item.team}</span>
              <h2 className="mt-2 text-sm font-bold text-slate-900">{item.title}</h2>
              <p className="mt-1 text-xs text-slate-500">발표자: {item.speaker}</p>
              <p className="text-xs text-slate-500">장소: {item.room}</p>
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input defaultChecked={item.liveQa} type="checkbox" />
                실시간 Q&A
              </label>
              <span
                className={
                  item.pendingQuestions > 0
                    ? 'rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600'
                    : 'rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500'
                }
              >
                대기 {item.pendingQuestions}건
              </span>
            </div>
          </article>
        ))}
      </div>
    </AdminScreen>
  );
}
