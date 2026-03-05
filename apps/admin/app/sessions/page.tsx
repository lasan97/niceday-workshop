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
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  async function loadSessions() {
    try {
      const data = await workshopApi.getSessions();
      setSessions(data);
    } catch {
      setNotice('세션 조회에 실패했습니다.');
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  async function handleCreateSession() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    try {
      await workshopApi.createSession({
        team: '신규팀',
        title: '새 세션',
        speaker: '발표자',
        room: '장소 입력',
        liveQa: false,
        pendingQuestions: 0,
      });
      await loadSessions();
      setNotice('세션을 추가했습니다.');
    } catch {
      setNotice('세션 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveSession(item: SessionResponse) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    try {
      await workshopApi.updateSession(item.id, {
        team: item.team,
        title: item.title,
        speaker: item.speaker,
        room: item.room,
        liveQa: item.liveQa,
        pendingQuestions: item.pendingQuestions,
      });
      setNotice('세션을 저장했습니다.');
    } catch {
      setNotice('세션 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSession(id: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    try {
      await workshopApi.deleteSession(id);
      await loadSessions();
      setNotice('세션을 삭제했습니다.');
    } catch {
      setNotice('세션 삭제에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminScreen
      title="세션 관리"
      subtitle="컨퍼런스 발표 관리"
      action={
        <button
          type="button"
          className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white"
          onClick={() => {
            void handleCreateSession();
          }}
        >
          + 추가
        </button>
      }
    >
      {notice ? <p className="mb-3 text-xs font-semibold text-slate-600">{notice}</p> : null}
      <div className="space-y-3">
        {sessions.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <input
                className="w-full rounded border border-slate-300 px-2 py-1 text-[10px] font-bold text-primary"
                value={item.team}
                onChange={(event) => {
                  setSessions((prev) =>
                    prev.map((session) =>
                      session.id === item.id ? { ...session, team: event.target.value } : session,
                    ),
                  );
                }}
              />
              <input
                className="mt-2 w-full rounded border border-slate-300 px-2 py-2 text-sm font-bold text-slate-900"
                value={item.title}
                onChange={(event) => {
                  setSessions((prev) =>
                    prev.map((session) =>
                      session.id === item.id ? { ...session, title: event.target.value } : session,
                    ),
                  );
                }}
              />
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-500"
                value={item.speaker}
                onChange={(event) => {
                  setSessions((prev) =>
                    prev.map((session) =>
                      session.id === item.id ? { ...session, speaker: event.target.value } : session,
                    ),
                  );
                }}
              />
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-500"
                value={item.room}
                onChange={(event) => {
                  setSessions((prev) =>
                    prev.map((session) =>
                      session.id === item.id ? { ...session, room: event.target.value } : session,
                    ),
                  );
                }}
              />
            </div>
            <div className="bg-slate-50 px-4 py-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  checked={item.liveQa}
                  type="checkbox"
                  onChange={(event) => {
                    setSessions((prev) =>
                      prev.map((session) =>
                        session.id === item.id ? { ...session, liveQa: event.target.checked } : session,
                      ),
                    );
                  }}
                />
                실시간 Q&A
              </label>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                  onClick={() => {
                    void handleSaveSession(item);
                  }}
                >
                  저장
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                  onClick={() => {
                    void handleDeleteSession(item.id);
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AdminScreen>
  );
}
