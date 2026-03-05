'use client';

import { useEffect, useState } from 'react';
import type { SessionResponse, TeamResponse } from '@workshop/types';
import { ApiRequestError, workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';
import { PageSpinner } from '../components/PageSpinner';
import { Toast } from '../components/Toast';

type ToastState = { type: 'success' | 'error'; message: string } | null;
type SessionFieldKey = 'workshopTeamId' | 'title' | 'description' | 'runningMinutes';
type SessionFieldErrors = Partial<Record<SessionFieldKey, string>>;

type SessionForm = {
  id: string | null;
  workshopTeamId: string;
  title: string;
  description: string;
  runningMinutes: number;
};

const emptyForm: SessionForm = {
  id: null,
  workshopTeamId: '',
  title: '',
  description: '',
  runningMinutes: 30,
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SessionForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<SessionFieldErrors>({});

  async function loadSessions() {
    const data = await workshopApi.getSessions();
    setSessions(data);
  }

  async function loadTeams() {
    const data = await workshopApi.getTeams();
    setTeams(data);
  }

  async function refresh() {
    try {
      await Promise.all([loadSessions(), loadTeams()]);
    } catch {
      setToast({ type: 'error', message: '세션/팀 조회에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function openCreateModal() {
    setFieldErrors({});
    setForm({ ...emptyForm, workshopTeamId: teams[0]?.id ?? '' });
    setModalOpen(true);
  }

  function openEditModal(session: SessionResponse) {
    setFieldErrors({});
    setForm({
      id: session.id,
      workshopTeamId: session.workshopTeamId,
      title: session.title,
      description: session.description,
      runningMinutes: session.runningMinutes,
    });
    setModalOpen(true);
  }

  function validateForm(): boolean {
    const errors: SessionFieldErrors = {};
    if (!form.workshopTeamId.trim()) {
      errors.workshopTeamId = '워크샵 팀을 선택해주세요.';
    }
    if (!form.title.trim()) {
      errors.title = '제목을 입력해주세요.';
    }
    if (!form.description.trim()) {
      errors.description = '설명을 입력해주세요.';
    }
    if (form.runningMinutes < 1) {
      errors.runningMinutes = '러닝타임은 1분 이상이어야 합니다.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSaveSession() {
    if (submitting || !validateForm()) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      const payload = {
        workshopTeamId: form.workshopTeamId,
        title: form.title,
        description: form.description,
        runningMinutes: form.runningMinutes,
      };

      if (form.id) {
        await workshopApi.updateSession(form.id, payload);
        setToast({ type: 'success', message: '세션을 저장했습니다.' });
      } else {
        await workshopApi.createSession(payload);
        setToast({ type: 'success', message: '세션을 추가했습니다.' });
      }

      setModalOpen(false);
      await loadSessions();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors(error.fieldErrors as SessionFieldErrors);
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

  async function handleMoveSession(index: number, direction: 'up' | 'down') {
    if (submitting) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sessions.length) {
      return;
    }

    const reordered = [...sessions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.reorderSessions({ orderedIds: reordered.map((session) => session.id) });
      setSessions(reordered.map((session, reorderedIndex) => ({ ...session, displayOrder: reorderedIndex + 1 })));
      setToast({ type: 'success', message: '세션 순서를 변경했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '세션 순서 변경에 실패했습니다.',
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
          disabled={submitting || loading}
          onClick={openCreateModal}
        >
          + 추가
        </button>
      }
    >
      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      {loading ? <PageSpinner label="세션 목록을 불러오는 중..." /> : null}

      {!loading ? (
        <div className="space-y-3">
          {sessions.map((item, index) => (
            <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">
                    {item.workshopTeamName ?? '미배정'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">#{item.displayOrder}</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                <p className="mt-2 text-xs font-semibold text-slate-600">러닝타임 {item.runningMinutes}분</p>
              </div>

              <div className="grid grid-cols-4 gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 bg-white py-1 text-[10px] font-semibold text-slate-700 disabled:opacity-50"
                  disabled={submitting || index === 0}
                  onClick={() => {
                    void handleMoveSession(index, 'up');
                  }}
                >
                  위로
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 bg-white py-1 text-[10px] font-semibold text-slate-700 disabled:opacity-50"
                  disabled={submitting || index === sessions.length - 1}
                  onClick={() => {
                    void handleMoveSession(index, 'down');
                  }}
                >
                  아래로
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold"
                  disabled={submitting}
                  onClick={() => openEditModal(item)}
                >
                  편집
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-200 bg-red-50 py-1 text-[10px] font-semibold text-red-600"
                  disabled={submitting}
                  onClick={() => {
                    void handleDeleteSession(item.id);
                  }}
                >
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">{form.id ? '세션 편집' : '세션 추가'}</h3>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setModalOpen(false)}
              >
                닫기
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-[10px] font-semibold text-slate-500">워크샵 팀</label>
              <select
                className={`w-full rounded border px-2 py-2 text-xs ${
                  fieldErrors.workshopTeamId ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={form.workshopTeamId}
                disabled={submitting}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, workshopTeamId: undefined }));
                  setForm((prev) => ({ ...prev, workshopTeamId: event.target.value }));
                }}
              >
                <option value="">선택하세요</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              {fieldErrors.workshopTeamId ? (
                <p className="text-[10px] font-semibold text-red-600">{fieldErrors.workshopTeamId}</p>
              ) : null}

              <label className="text-[10px] font-semibold text-slate-500">제목</label>
              <input
                className={`w-full rounded border px-2 py-2 text-xs ${
                  fieldErrors.title ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={form.title}
                disabled={submitting}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, title: undefined }));
                  setForm((prev) => ({ ...prev, title: event.target.value }));
                }}
              />
              {fieldErrors.title ? <p className="text-[10px] font-semibold text-red-600">{fieldErrors.title}</p> : null}

              <label className="text-[10px] font-semibold text-slate-500">설명</label>
              <textarea
                className={`w-full rounded border px-2 py-2 text-xs ${
                  fieldErrors.description ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                rows={3}
                value={form.description}
                disabled={submitting}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, description: undefined }));
                  setForm((prev) => ({ ...prev, description: event.target.value }));
                }}
              />
              {fieldErrors.description ? (
                <p className="text-[10px] font-semibold text-red-600">{fieldErrors.description}</p>
              ) : null}

              <label className="text-[10px] font-semibold text-slate-500">러닝타임(분)</label>
              <input
                className={`w-full rounded border px-2 py-2 text-xs ${
                  fieldErrors.runningMinutes ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                type="number"
                min={1}
                value={form.runningMinutes}
                disabled={submitting}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, runningMinutes: undefined }));
                  setForm((prev) => ({ ...prev, runningMinutes: Number(event.target.value) || 0 }));
                }}
              />
              {fieldErrors.runningMinutes ? (
                <p className="text-[10px] font-semibold text-red-600">{fieldErrors.runningMinutes}</p>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 py-2 text-xs font-semibold text-slate-700"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                취소
              </button>
              <button
                type="button"
                className="rounded-md bg-primary py-2 text-xs font-semibold text-white disabled:opacity-50"
                onClick={() => {
                  void handleSaveSession();
                }}
                disabled={submitting}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminScreen>
  );
}
