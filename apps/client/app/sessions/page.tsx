'use client';

import { useEffect, useState } from 'react';
import type { SessionResponse } from '@workshop/types';
import { MarkdownText, markdownToPlainText, twoLineClampStyle } from '@workshop/ui';
import { workshopApi } from '../../lib/workshop-api';
import { PageSpinner } from '../components/PageSpinner';
import { ClientScreen } from '../components/ClientScreen';

type SessionQuestion = Awaited<ReturnType<typeof workshopApi.getSessionQuestions>>[number];
type ToastState = { type: 'success' | 'error'; message: string } | null;
type AuthMeResponse = { username: string; role: 'ADMIN' | 'PARTICIPANT'; team: string };

function normalizeTeam(team: string | null | undefined): string {
  return (team ?? '').trim();
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [detailSession, setDetailSession] = useState<SessionResponse | null>(null);
  const [modalSession, setModalSession] = useState<SessionResponse | null>(null);
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  async function fetchMe(): Promise<AuthMeResponse | null> {
    const meResponse = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!meResponse.ok) {
      return null;
    }
    return (await meResponse.json()) as AuthMeResponse;
  }

  const canAnswer = Boolean(
    me
      && modalSession
      && (me.role === 'ADMIN' || normalizeTeam(me.team) === normalizeTeam(modalSession.team)),
  );

  useEffect(() => {
    async function load() {
      try {
        const [data, meBody] = await Promise.all([
          workshopApi.getSessions(),
          fetchMe(),
        ]);
        setSessions(data);
        if (meBody) {
          setMe(meBody);
        }
      } catch {
        setSessions([]);
        setMe(null);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function openQaModal(session: SessionResponse) {
    try {
      setModalSession(session);
      setQuestionText('');
      setAnswerDrafts({});
      setToast(null);
      setLoadingQuestions(true);
      const [list, meBody] = await Promise.all([
        workshopApi.getSessionQuestions(session.id),
        fetchMe(),
      ]);
      setQuestions(list);
      setMe(meBody);
      setAnswerDrafts(
        Object.fromEntries(list.map((item) => [item.id, item.answer ?? ''])),
      );
    } catch {
      setQuestions([]);
      setToast({ type: 'error', message: '질문 목록을 불러오지 못했습니다.' });
    } finally {
      setLoadingQuestions(false);
    }
  }

  async function refreshQuestions(sessionId: string) {
    const list = await workshopApi.getSessionQuestions(sessionId);
    setQuestions(list);
    setAnswerDrafts(Object.fromEntries(list.map((item) => [item.id, item.answer ?? ''])));
  }

  async function submitQuestion() {
    if (!modalSession || submitting || !questionText.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await workshopApi.createSessionQuestion(modalSession.id, { question: questionText.trim() });
      await refreshQuestions(modalSession.id);
      setQuestionText('');
      setToast({ type: 'success', message: '질문을 등록했습니다.' });
    } catch {
      setToast({ type: 'error', message: '질문 등록에 실패했습니다.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAnswer(questionId: string) {
    if (!modalSession || submitting) {
      return;
    }
    if (!canAnswer) {
      return;
    }
    const answer = answerDrafts[questionId]?.trim();
    if (!answer) {
      return;
    }
    setSubmitting(true);
    try {
      await workshopApi.answerSessionQuestion(modalSession.id, questionId, { answer });
      await refreshQuestions(modalSession.id);
      setAnswerDrafts((prev) => ({ ...prev, [questionId]: answer }));
      setToast({ type: 'success', message: '답변을 저장했습니다.' });
    } catch {
      setToast({ type: 'error', message: '답변 등록에 실패했습니다.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ClientScreen title="팀 컨퍼런스" subtitle="강릉 컨벤션 센터">
      {loading ? <PageSpinner label="세션 정보를 불러오는 중..." /> : null}
      {!loading ? (
        <div className="space-y-3 pb-4">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)]"
            >
              <div
                role="button"
                tabIndex={0}
                className="cursor-pointer bg-gradient-to-b from-sky-50/50 to-white p-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={() => setDetailSession(session)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setDetailSession(session);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700">
                    {session.team}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                    {session.runningMinutes}분
                  </span>
                </div>
                <h3 className="mt-3 text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-slate-900">
                  {session.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600" style={twoLineClampStyle}>
                  {markdownToPlainText(session.description)}
                </p>
              </div>
              <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                <button
                  className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void openQaModal(session);
                  }}
                >
                  Q&amp;A
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {detailSession ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">{detailSession.team}</p>
                <h3 className="text-base font-bold text-slate-900">{detailSession.title}</h3>
              </div>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setDetailSession(null)}
              >
                닫기
              </button>
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">러닝타임 {detailSession.runningMinutes}분</p>
            <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <MarkdownText content={detailSession.description} />
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white"
                onClick={() => {
                  setDetailSession(null);
                  void openQaModal(detailSession);
                }}
              >
                Q&amp;A 열기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modalSession ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">{modalSession.team}</p>
                <h3 className="text-sm font-bold text-slate-900">{modalSession.title} Q&A</h3>
              </div>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setModalSession(null)}
              >
                닫기
              </button>
            </div>

            {toast ? (
              <p className={`mt-2 text-xs font-semibold ${toast.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                {toast.message}
              </p>
            ) : null}

            <div className="mt-3 flex gap-2">
              <textarea
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                placeholder="질문을 입력하세요"
                rows={2}
                value={questionText}
                disabled={submitting}
                onChange={(event) => setQuestionText(event.target.value)}
              />
              <button
                type="button"
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                disabled={submitting}
                onClick={() => void submitQuestion()}
              >
                등록
              </button>
            </div>

            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {loadingQuestions ? <PageSpinner label="질문을 불러오는 중..." /> : null}
              {!loadingQuestions && questions.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                  등록된 질문이 없습니다.
                </p>
              ) : null}
              {!loadingQuestions
                ? questions.map((item) => (
                    <article key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-bold text-slate-500">Q.</p>
                      <p className="whitespace-pre-line text-xs font-semibold text-slate-800">{item.question}</p>
                      {item.answer ? (
                        <>
                          <p className="mt-2 text-[11px] font-bold text-emerald-600">A.</p>
                          <p className="whitespace-pre-line text-xs text-emerald-700">{item.answer}</p>
                        </>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500">
                          {modalSession ? `${modalSession.team}에서 답변을 다는것을 기다리는 중입니다.` : '답변을 기다리는 중입니다.'}
                        </p>
                      )}

                      {canAnswer ? (
                        <div className="mt-2 flex gap-2">
                          <textarea
                            className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                            placeholder="답변 입력"
                            rows={2}
                            value={answerDrafts[item.id] ?? ''}
                            disabled={submitting}
                            onChange={(event) => {
                              const value = event.target.value;
                              setAnswerDrafts((prev) => ({ ...prev, [item.id]: value }));
                            }}
                          />
                          <button
                            type="button"
                            className="rounded border border-primary px-2 py-1 text-xs font-semibold text-primary disabled:opacity-50"
                            disabled={submitting}
                            onClick={() => void submitAnswer(item.id)}
                          >
                            {item.answer ? '수정' : '답변'}
                          </button>
                        </div>
                      ) : null}
                    </article>
                  ))
                : null}
            </div>
          </div>
        </div>
      ) : null}
    </ClientScreen>
  );
}
