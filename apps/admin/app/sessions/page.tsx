'use client';

import { useEffect, useState } from 'react';
import type { SessionResponse } from '@workshop/types';
import { ApiRequestError, workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';
import { PageSpinner } from '../components/PageSpinner';
import { Toast } from '../components/Toast';

type SessionFieldKey = 'team' | 'title' | 'speaker' | 'room';
type SessionFieldErrors = Partial<Record<SessionFieldKey, string>>;
type ToastState = { type: 'success' | 'error'; message: string } | null;

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, SessionFieldErrors>>({});

  async function loadSessions() {
    try {
      const data = await workshopApi.getSessions();
      setSessions(data);
    } catch {
      setToast({ type: 'error', message: '세션 조회에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  function clearFieldError(id: string, key: SessionFieldKey) {
    setFieldErrors((prev) => {
      const row = prev[id];
      if (!row?.[key]) {
        return prev;
      }
      const nextRow = { ...row };
      delete nextRow[key];
      return { ...prev, [id]: nextRow };
    });
  }

  function setClientValidationErrors(item: SessionResponse): boolean {
    const errors: SessionFieldErrors = {};
    if (!item.team.trim()) {
      errors.team = '팀을 입력해주세요.';
    }
    if (!item.title.trim()) {
      errors.title = '제목을 입력해주세요.';
    }
    if (!item.speaker.trim()) {
      errors.speaker = '발표자를 입력해주세요.';
    }
    if (!item.room.trim()) {
      errors.room = '장소를 입력해주세요.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, [item.id]: errors }));
      setToast({ type: 'error', message: '입력값을 확인해주세요.' });
      return true;
    }

    setFieldErrors((prev) => ({ ...prev, [item.id]: {} }));
    return false;
  }

  async function handleCreateSession() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
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
      setToast({ type: 'success', message: '세션을 추가했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '세션 추가에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveSession(item: SessionResponse) {
    if (submitting) {
      return;
    }
    if (setClientValidationErrors(item)) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.updateSession(item.id, {
        team: item.team,
        title: item.title,
        speaker: item.speaker,
        room: item.room,
        liveQa: item.liveQa,
        pendingQuestions: item.pendingQuestions,
      });
      setToast({ type: 'success', message: '세션을 저장했습니다.' });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors((prev) => ({ ...prev, [item.id]: error.fieldErrors as SessionFieldErrors }));
      }
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '세션 저장에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSession(id: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.deleteSession(id);
      await loadSessions();
      setToast({ type: 'success', message: '세션을 삭제했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '세션 삭제에 실패했습니다.',
      });
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
          className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          disabled={submitting}
          onClick={() => {
            void handleCreateSession();
          }}
        >
          + 추가
        </button>
      }
    >
      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      {loading ? <PageSpinner label="세션 목록을 불러오는 중..." /> : null}
      {!loading ? (
      <div className="space-y-3">
        {sessions.map((item) => {
          const rowErrors = fieldErrors[item.id] ?? {};

          return (
            <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <input
                  className={`w-full rounded border px-2 py-1 text-[10px] font-bold text-primary ${
                    rowErrors.team ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                  value={item.team}
                  disabled={submitting}
                  onChange={(event) => {
                    clearFieldError(item.id, 'team');
                    setSessions((prev) =>
                      prev.map((session) =>
                        session.id === item.id ? { ...session, team: event.target.value } : session,
                      ),
                    );
                  }}
                />
                {rowErrors.team ? <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.team}</p> : null}
                <input
                  className={`mt-2 w-full rounded border px-2 py-2 text-sm font-bold text-slate-900 ${
                    rowErrors.title ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                  value={item.title}
                  disabled={submitting}
                  onChange={(event) => {
                    clearFieldError(item.id, 'title');
                    setSessions((prev) =>
                      prev.map((session) =>
                        session.id === item.id ? { ...session, title: event.target.value } : session,
                      ),
                    );
                  }}
                />
                {rowErrors.title ? (
                  <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.title}</p>
                ) : null}
                <input
                  className={`mt-1 w-full rounded border px-2 py-1 text-xs text-slate-500 ${
                    rowErrors.speaker ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                  value={item.speaker}
                  disabled={submitting}
                  onChange={(event) => {
                    clearFieldError(item.id, 'speaker');
                    setSessions((prev) =>
                      prev.map((session) =>
                        session.id === item.id ? { ...session, speaker: event.target.value } : session,
                      ),
                    );
                  }}
                />
                {rowErrors.speaker ? (
                  <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.speaker}</p>
                ) : null}
                <input
                  className={`mt-1 w-full rounded border px-2 py-1 text-xs text-slate-500 ${
                    rowErrors.room ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                  value={item.room}
                  disabled={submitting}
                  onChange={(event) => {
                    clearFieldError(item.id, 'room');
                    setSessions((prev) =>
                      prev.map((session) =>
                        session.id === item.id ? { ...session, room: event.target.value } : session,
                      ),
                    );
                  }}
                />
                {rowErrors.room ? <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.room}</p> : null}
              </div>
              <div className="bg-slate-50 px-4 py-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    checked={item.liveQa}
                    type="checkbox"
                    disabled={submitting}
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
                    disabled={submitting}
                    onClick={() => {
                      void handleSaveSession(item);
                    }}
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                    disabled={submitting}
                    onClick={() => {
                      void handleDeleteSession(item.id);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      ) : null}
    </AdminScreen>
  );
}
