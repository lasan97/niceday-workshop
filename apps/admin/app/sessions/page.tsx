'use client';

import { useEffect, useRef, useState } from 'react';
import type { SessionResponse } from '@workshop/types';
import { MarkdownText, markdownToPlainText, twoLineClampStyle } from '@workshop/ui';
import { ApiRequestError, workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';
import { PageSpinner } from '../components/PageSpinner';
import { Toast } from '../components/Toast';

type ToastState = { type: 'success' | 'error'; message: string } | null;
type SessionFieldKey = 'team' | 'title' | 'description' | 'runningMinutes';
type SessionFieldErrors = Partial<Record<SessionFieldKey, string>>;
type SessionQuestion = Awaited<ReturnType<typeof workshopApi.getSessionQuestions>>[number];

type SessionForm = {
  id: string | null;
  team: string;
  title: string;
  description: string;
  runningMinutes: number;
};

const emptyForm: SessionForm = {
  id: null,
  team: '',
  title: '',
  description: '',
  runningMinutes: 30,
};
const LONG_PRESS_MS = 1000;
const PRE_DRAG_HIGHLIGHT_DELAY_MS = 320;
const LONG_PRESS_CANCEL_DISTANCE_PX = 24;

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [userTeams, setUserTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalSession, setDetailModalSession] = useState<SessionResponse | null>(null);
  const [qaModalSession, setQaModalSession] = useState<SessionResponse | null>(null);
  const [qaQuestions, setQaQuestions] = useState<SessionQuestion[]>([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaSubmitting, setQaSubmitting] = useState(false);
  const [form, setForm] = useState<SessionForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<SessionFieldErrors>({});
  const [descriptionEditorTab, setDescriptionEditorTab] = useState<'editor' | 'preview'>('editor');
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

  async function loadUserTeams() {
    const users = await workshopApi.getUsers();
    const teams = Array.from(
      new Set(
        users
          .map((user) => user.team.trim())
          .filter((teamName) => teamName.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b, 'ko'));
    setUserTeams(teams);
  }

  async function refresh() {
    try {
      await Promise.all([loadSessions(), loadUserTeams()]);
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
    setDescriptionEditorTab('editor');
    setForm({ ...emptyForm, team: userTeams[0] ?? '미배정' });
    setModalOpen(true);
  }

  function openEditModal(session: SessionResponse) {
    setFieldErrors({});
    setDescriptionEditorTab('editor');
    setForm({
      id: session.id,
      team: session.team || '미배정',
      title: session.title,
      description: session.description,
      runningMinutes: session.runningMinutes,
    });
    setModalOpen(true);
  }

  function openDetailModal(session: SessionResponse) {
    if (reorderMode) {
      return;
    }
    setDetailModalSession(session);
  }

  const sessionTeamOptions = Array.from(
    new Set(
      ['미배정', ...userTeams, form.team]
        .map((teamName) => teamName?.trim())
        .filter((teamName): teamName is string => Boolean(teamName && teamName.length > 0)),
    ),
  );

  function validateForm(): boolean {
    const errors: SessionFieldErrors = {};
    if (!form.team.trim()) {
      errors.team = '팀을 선택해주세요.';
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
        team: form.team,
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

  async function openQaModal(session: SessionResponse) {
    setQaModalSession(session);
    setQaLoading(true);
    setToast(null);
    try {
      const data = await workshopApi.getSessionQuestions(session.id);
      setQaQuestions(data);
    } catch (error) {
      setQaQuestions([]);
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : 'Q&A 조회에 실패했습니다.',
      });
    } finally {
      setQaLoading(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!qaModalSession || qaSubmitting) {
      return;
    }
    setQaSubmitting(true);
    setToast(null);
    try {
      await workshopApi.deleteSessionQuestion(qaModalSession.id, questionId);
      const data = await workshopApi.getSessionQuestions(qaModalSession.id);
      setQaQuestions(data);
      setToast({ type: 'success', message: '질문을 삭제했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '질문 삭제에 실패했습니다.',
      });
    } finally {
      setQaSubmitting(false);
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
              <div
                role="button"
                tabIndex={reorderMode ? -1 : 0}
                className={`${reorderMode ? 'cursor-default' : 'cursor-pointer'} p-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
                onClick={() => openDetailModal(item)}
                onKeyDown={(event) => {
                  if (reorderMode) {
                    return;
                  }
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openDetailModal(item);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">
                    {item.team}
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
                <p className="mt-1 text-xs text-slate-500" style={twoLineClampStyle}>
                  {markdownToPlainText(item.description)}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-600">러닝타임 {item.runningMinutes}분</p>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold"
                  disabled={submitting || reorderMode}
                  onClick={(event) => {
                    event.stopPropagation();
                    openEditModal(item);
                  }}
                >
                  편집
                </button>
                <button
                  type="button"
                  className="rounded-md border border-sky-200 bg-sky-50 py-1 text-[10px] font-semibold text-sky-700"
                  disabled={submitting || reorderMode}
                  onClick={(event) => {
                    event.stopPropagation();
                    void openQaModal(item);
                  }}
                >
                  Q&A
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-200 bg-red-50 py-1 text-[10px] font-semibold text-red-600"
                  disabled={submitting || reorderMode}
                  onClick={(event) => {
                    event.stopPropagation();
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
              <label className="text-[10px] font-semibold text-slate-500">팀</label>
              <select
                className={`w-full rounded border px-2 py-2 text-xs ${
                  fieldErrors.team ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={form.team}
                disabled={submitting}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, team: undefined }));
                  setForm((prev) => ({ ...prev, team: event.target.value }));
                }}
              >
                {sessionTeamOptions.map((teamName) => (
                  <option key={teamName} value={teamName}>
                    {teamName}
                  </option>
                ))}
              </select>
              {fieldErrors.team ? (
                <p className="text-[10px] font-semibold text-red-600">{fieldErrors.team}</p>
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
              {fieldErrors.description ? (
                <p className="text-[10px] font-semibold text-red-600">{fieldErrors.description}</p>
              ) : null}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold text-slate-500">설명 편집</p>
                  <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                        descriptionEditorTab === 'editor' ? 'bg-slate-900 text-white' : 'text-slate-500'
                      }`}
                      onClick={() => setDescriptionEditorTab('editor')}
                    >
                      에디터
                    </button>
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                        descriptionEditorTab === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-500'
                      }`}
                      onClick={() => setDescriptionEditorTab('preview')}
                    >
                      미리보기
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">툴바 없이 마크다운 문법만 지원합니다.</p>
                {descriptionEditorTab === 'editor' ? (
                  <textarea
                    className={`mt-2 min-h-40 w-full rounded-lg border px-3 py-3 text-xs ${
                      fieldErrors.description ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300 bg-white'
                    }`}
                    placeholder="마크다운으로 설명을 입력하세요."
                    value={form.description}
                    disabled={submitting}
                    onChange={(event) => {
                      setFieldErrors((prev) => ({ ...prev, description: undefined }));
                      setForm((prev) => ({ ...prev, description: event.target.value }));
                    }}
                  />
                ) : form.description.trim() ? (
                  <div className="mt-2 min-h-40 rounded-lg border border-slate-200 bg-white p-3">
                    <MarkdownText content={form.description} />
                  </div>
                ) : (
                  <div className="mt-2 flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-3">
                    <p className="text-xs text-slate-400">설명을 입력하면 여기에 preview가 표시됩니다.</p>
                  </div>
                )}
              </div>

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

      {detailModalSession ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <p className="text-[10px] font-semibold text-slate-400">{detailModalSession.team}</p>
                <h3 className="text-sm font-bold text-slate-900">{detailModalSession.title}</h3>
              </div>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setDetailModalSession(null)}
              >
                닫기
              </button>
            </div>
            <p className="mt-3 text-[11px] font-semibold text-slate-500">러닝타임 {detailModalSession.runningMinutes}분</p>
            <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
              <MarkdownText content={detailModalSession.description} />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                onClick={() => {
                  openEditModal(detailModalSession);
                  setDetailModalSession(null);
                }}
              >
                편집
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {qaModalSession ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <p className="text-[10px] font-semibold text-slate-400">{qaModalSession.team}</p>
                <h3 className="text-sm font-bold text-slate-900">{qaModalSession.title} Q&A</h3>
              </div>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setQaModalSession(null)}
              >
                닫기
              </button>
            </div>

            <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
              {qaLoading ? <PageSpinner label="Q&A를 불러오는 중..." /> : null}
              {!qaLoading && qaQuestions.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-center text-xs text-slate-500">
                  등록된 질문이 없습니다.
                </p>
              ) : null}
              {!qaLoading
                ? qaQuestions.map((question) => (
                    <article key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-bold text-slate-500">Q.</p>
                      <p className="whitespace-pre-line text-xs font-semibold text-slate-800">{question.question}</p>
                      {question.answer ? (
                        <>
                          <p className="mt-1 text-[11px] font-bold text-slate-500">A.</p>
                          <p className="whitespace-pre-line text-xs text-slate-600">{question.answer}</p>
                        </>
                      ) : (
                        <p className="mt-1 text-xs text-slate-500">답변 대기</p>
                      )}
                      <button
                        type="button"
                        className="mt-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 disabled:opacity-50"
                        disabled={qaSubmitting}
                        onClick={() => {
                          void handleDeleteQuestion(question.id);
                        }}
                      >
                        삭제
                      </button>
                    </article>
                  ))
                : null}
            </div>
          </div>
        </div>
      ) : null}
    </AdminScreen>
  );
}
