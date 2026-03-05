'use client';

import { useEffect, useState } from 'react';
import type { SessionResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { ClientScreen } from '../components/ClientScreen';

const fallbackSessions: SessionResponse[] = [
  {
    id: 'ses-local-1',
    team: '알파팀',
    title: '디자인에서의 AI 혁신',
    speaker: '제인 도',
    room: '101호',
    liveQa: true,
    pendingQuestions: 3,
  },
];

export default function SessionsPage() {
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
    <ClientScreen title="팀 컨퍼런스" subtitle="강릉 컨벤션 센터">
      <div className="space-y-3 pb-4">
        {sessions.map((session) => (
          <article key={session.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4">
              <h3 className="text-sm font-bold text-slate-900">{session.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{session.room}</p>
              <p className="text-xs text-slate-500">
                {session.team} · 발표자 {session.speaker}
              </p>
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
    </ClientScreen>
  );
}
