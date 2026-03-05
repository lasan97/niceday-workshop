'use client';

import { useEffect, useRef, useState } from 'react';
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
const LONG_PRESS_MS = 1000;
const PRE_DRAG_HIGHLIGHT_DELAY_MS = 320;
const LONG_PRESS_CANCEL_DISTANCE_PX = 24;

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SessionForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<SessionFieldErrors>({});
  const [draggingSessionId, setDraggingSessionId] = useState<string | null>(null);
  const [dragOverSessionId, setDragOverSessionId] = useState<string | null>(null);
  const [pendingLongPressSessionId, setPendingLongPressSessionId] = useState<string | null>(null);
  const dragStartSessionsRef = useRef<SessionResponse[] | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTouchSessionIdRef = useRef<string | null>(null);
  const touchStartPointRef = useRef<{ x: number; y: number } | null>(null);

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    return () => {
      clearPendingLongPress();
      unlockScroll();
    };
  }, []);

  useEffect(() => {
    if (!draggingSessionId) {
      return;
    }

    const preventScroll = (event: Event) => {
      event.preventDefault();
    };

    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('wheel', preventScroll, { passive: false });
    return () => {
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('wheel', preventScroll);
    };
  }, [draggingSessionId]);

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

  function lockScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  function clearPendingLongPress() {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setPendingLongPressSessionId(null);
    pendingTouchSessionIdRef.current = null;
    touchStartPointRef.current = null;
  }

  function resetDragState() {
    setDraggingSessionId(null);
    setDragOverSessionId(null);
    dragStartSessionsRef.current = null;
    clearPendingLongPress();
    unlockScroll();
  }

  function reorderLocally(sourceSessionId: string, targetSessionId: string) {
    if (sourceSessionId === targetSessionId) {
      return;
    }
    setSessions((prev) => {
      const sourceIndex = prev.findIndex((session) => session.id === sourceSessionId);
      const targetIndex = prev.findIndex((session) => session.id === targetSessionId);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        return prev;
      }
      const reordered = [...prev];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      return reordered.map((session, reorderedIndex) => ({ ...session, displayOrder: reorderedIndex + 1 }));
    });
  }

  function hasOrderChanged() {
    if (!dragStartSessionsRef.current) {
      return false;
    }
    const originalIds = dragStartSessionsRef.current.map((session) => session.id);
    const currentIds = sessions.map((session) => session.id);
    if (originalIds.length !== currentIds.length) {
      return true;
    }
    return originalIds.some((id, index) => id !== currentIds[index]);
  }

  async function handleDropSession() {
    if (submitting || !draggingSessionId) {
      return;
    }
    if (!hasOrderChanged()) {
      resetDragState();
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.reorderSessions({ orderedIds: sessions.map((session) => session.id) });
      setToast({ type: 'success', message: '세션 순서를 변경했습니다.' });
    } catch (error) {
      if (dragStartSessionsRef.current) {
        setSessions(dragStartSessionsRef.current);
      }
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '세션 순서 변경에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
      resetDragState();
    }
  }

  function findSessionIdAtPoint(clientX: number, clientY: number): string | null {
    const element = document.elementFromPoint(clientX, clientY);
    const card = element?.closest<HTMLElement>('[data-session-id]');
    return card?.dataset.sessionId ?? null;
  }

  function isInteractiveTouchTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    return Boolean(target.closest('button, a, input, textarea, select, label'));
  }

  function activateTouchDrag(sessionId: string) {
    if (submitting || !reorderMode) {
      clearPendingLongPress();
      return;
    }
    if (!dragStartSessionsRef.current) {
      dragStartSessionsRef.current = sessions;
    }
    lockScroll();
    setDraggingSessionId(sessionId);
    setDragOverSessionId(sessionId);
    clearPendingLongPress();
  }

  function handleTouchStart(event: React.TouchEvent<HTMLElement>, sessionId: string) {
    if (submitting || !reorderMode) {
      return;
    }
    if (draggingSessionId) {
      return;
    }
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    clearPendingLongPress();
    pendingTouchSessionIdRef.current = sessionId;
    touchStartPointRef.current = { x: touch.clientX, y: touch.clientY };
    previewTimerRef.current = setTimeout(() => {
      if (pendingTouchSessionIdRef.current) {
        setPendingLongPressSessionId(pendingTouchSessionIdRef.current);
      }
    }, PRE_DRAG_HIGHLIGHT_DELAY_MS);
    longPressTimerRef.current = setTimeout(() => {
      if (pendingTouchSessionIdRef.current) {
        activateTouchDrag(pendingTouchSessionIdRef.current);
      }
    }, LONG_PRESS_MS);
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (!reorderMode) {
      return;
    }

    if (!draggingSessionId) {
      const touch = event.touches[0];
      const startPoint = touchStartPointRef.current;
      const pendingSessionId = pendingTouchSessionIdRef.current;
      if (!touch || !startPoint || !pendingSessionId) {
        return;
      }
      const movedDistanceX = Math.abs(touch.clientX - startPoint.x);
      const movedDistanceY = Math.abs(touch.clientY - startPoint.y);
      if (movedDistanceX > LONG_PRESS_CANCEL_DISTANCE_PX || movedDistanceY > LONG_PRESS_CANCEL_DISTANCE_PX) {
        clearPendingLongPress();
        return;
      }

      // 옅은 외곽선이 보인 이후에는 바로 드래그를 시작할 수 있게 한다.
      if (pendingLongPressSessionId === pendingSessionId) {
        event.preventDefault();
        activateTouchDrag(pendingSessionId);
        const targetSessionId = findSessionIdAtPoint(touch.clientX, touch.clientY);
        if (targetSessionId) {
          setDragOverSessionId(targetSessionId);
          reorderLocally(pendingSessionId, targetSessionId);
        }
      }
      return;
    }
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    const targetSessionId = findSessionIdAtPoint(touch.clientX, touch.clientY);
    if (targetSessionId) {
      setDragOverSessionId(targetSessionId);
      reorderLocally(draggingSessionId, targetSessionId);
    }
    event.preventDefault();
  }

  function handleTouchCancel() {
    if (draggingSessionId) {
      // iOS Safari에서 touchcancel이 과도하게 발생해 선택이 바로 풀리는 문제를 방지한다.
      return;
    }
    clearPendingLongPress();
  }

  async function handleTouchEnd() {
    if (!reorderMode) {
      clearPendingLongPress();
      return;
    }

    if (!draggingSessionId) {
      clearPendingLongPress();
      return;
    }
    await handleDropSession();
  }

  function toggleReorderMode() {
    if (submitting) {
      return;
    }
    if (reorderMode) {
      if (dragStartSessionsRef.current) {
        setSessions(dragStartSessionsRef.current);
      }
      resetDragState();
      setReorderMode(false);
      setToast({ type: 'success', message: '정렬 모드를 종료했습니다.' });
      return;
    }
    setReorderMode(true);
    setToast({ type: 'success', message: '정렬 모드가 켜졌습니다. 카드를 길게 눌러 이동하세요.' });
  }

  return (
    <AdminScreen
      title="세션 관리"
      subtitle="컨퍼런스 발표 관리"
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded-full px-3 py-2 text-xs font-bold disabled:opacity-50 ${
              reorderMode ? 'border border-primary bg-white text-primary' : 'bg-slate-700 text-white'
            }`}
            disabled={submitting || loading}
            onClick={toggleReorderMode}
          >
            {reorderMode ? '정렬 종료' : '정렬 모드'}
          </button>
          <button
            type="button"
            className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
            disabled={submitting || loading || reorderMode}
            onClick={openCreateModal}
          >
            + 추가
          </button>
        </div>
      }
    >
      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      {loading ? <PageSpinner label="세션 목록을 불러오는 중..." /> : null}

      {!loading ? (
        <div className="space-y-3" onTouchMove={handleTouchMove} onTouchEnd={() => void handleTouchEnd()} onTouchCancel={handleTouchCancel}>
          {sessions.map((item) => (
            <article
              key={item.id}
              data-session-id={item.id}
              draggable={reorderMode && !submitting && !isTouchDevice}
              onTouchStart={(event) => {
                if (isInteractiveTouchTarget(event.target)) {
                  return;
                }
                handleTouchStart(event, item.id);
              }}
              onDragStart={() => {
                if (isTouchDevice) {
                  return;
                }
                if (!reorderMode) {
                  return;
                }
                dragStartSessionsRef.current = sessions;
                lockScroll();
                setDraggingSessionId(item.id);
                setDragOverSessionId(item.id);
              }}
              onDragOver={(event) => {
                if (isTouchDevice) {
                  return;
                }
                if (!reorderMode) {
                  return;
                }
                event.preventDefault();
                setDragOverSessionId(item.id);
                if (draggingSessionId) {
                  reorderLocally(draggingSessionId, item.id);
                }
              }}
              onDragLeave={() => {
                if (dragOverSessionId === item.id) {
                  setDragOverSessionId(null);
                }
              }}
              onDrop={(event) => {
                if (isTouchDevice) {
                  return;
                }
                event.preventDefault();
              }}
              onDragEnd={() => {
                if (isTouchDevice) {
                  return;
                }
                if (!reorderMode) {
                  return;
                }
                void handleDropSession();
              }}
              onContextMenu={(event) => {
                if (reorderMode || draggingSessionId === item.id) {
                  event.preventDefault();
                }
              }}
              className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
                draggingSessionId === item.id
                  ? 'border-primary ring-2 ring-primary/35 opacity-90 scale-[1.01]'
                  : pendingLongPressSessionId === item.id
                    ? 'border-primary/60 ring-1 ring-primary/20'
                  : dragOverSessionId === item.id
                    ? 'border-primary ring-1 ring-primary/30'
                    : 'border-slate-200'
              }`}
              style={
                reorderMode
                  ? {
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                    }
                  : undefined
              }
            >
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">
                    {item.workshopTeamName ?? '미배정'}
                  </span>
                  <span
                    className={`select-none rounded-full border px-2 py-1 text-[10px] font-semibold ${
                      reorderMode
                        ? 'cursor-grab border-primary/30 bg-primary/10 text-primary active:cursor-grabbing'
                        : 'cursor-default border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                    onTouchStart={(event) => {
                      event.stopPropagation();
                      handleTouchStart(event, item.id);
                    }}
                    style={{ touchAction: 'auto' }}
                  >
                    # {item.displayOrder}
                    {reorderMode ? ' · 길게 눌러 이동' : ''}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                <p className="mt-2 text-xs font-semibold text-slate-600">러닝타임 {item.runningMinutes}분</p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold"
                  disabled={submitting || reorderMode}
                  onClick={() => openEditModal(item)}
                >
                  편집
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-200 bg-red-50 py-1 text-[10px] font-semibold text-red-600"
                  disabled={submitting || reorderMode}
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
