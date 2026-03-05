'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ScheduleItemResponse } from '@workshop/types';
import { ApiRequestError, workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';
import { Toast } from '../components/Toast';

const fallbackSchedules: ScheduleItemResponse[] = [
  {
    id: 'sch-local-1',
    day: '1일차',
    startsAt: '09:00',
    endsAt: '10:30',
    title: '등록 및 환영',
    location: '그랜드 로비',
  },
  {
    id: 'sch-local-2',
    day: '2일차',
    startsAt: '09:00',
    endsAt: '12:00',
    title: '팀 빌딩 미션',
    location: '강릉 해변',
  },
];

type ScheduleFieldKey = 'startsAt' | 'endsAt' | 'title' | 'location';
type ScheduleFieldErrors = Partial<Record<ScheduleFieldKey, string>>;
type ToastState = { type: 'success' | 'error'; message: string } | null;

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItemResponse[]>(fallbackSchedules);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, ScheduleFieldErrors>>({});

  async function loadSchedules() {
    try {
      const data = await workshopApi.getSchedules();
      setSchedules(data);
    } catch {
      setToast({ type: 'error', message: '일정 조회에 실패했습니다. 로컬 데이터를 표시합니다.' });
    }
  }

  useEffect(() => {
    void loadSchedules();
  }, []);

  function clearFieldError(id: string, key: ScheduleFieldKey) {
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

  function setClientValidationErrors(item: ScheduleItemResponse): boolean {
    const errors: ScheduleFieldErrors = {};
    if (!item.startsAt.trim()) {
      errors.startsAt = '시작 시간을 입력해주세요.';
    }
    if (!item.endsAt.trim()) {
      errors.endsAt = '종료 시간을 입력해주세요.';
    }
    if (!item.title.trim()) {
      errors.title = '제목을 입력해주세요.';
    }
    if (!item.location.trim()) {
      errors.location = '장소를 입력해주세요.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, [item.id]: errors }));
      setToast({ type: 'error', message: '입력값을 확인해주세요.' });
      return true;
    }

    setFieldErrors((prev) => ({ ...prev, [item.id]: {} }));
    return false;
  }

  async function handleCreate(day: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.createSchedule({
        day,
        startsAt: '09:00',
        endsAt: '10:00',
        title: '새 일정',
        location: '장소 입력',
      });
      await loadSchedules();
      setToast({ type: 'success', message: '일정을 추가했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '일정 추가에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave(item: ScheduleItemResponse) {
    if (submitting) {
      return;
    }
    if (setClientValidationErrors(item)) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.updateSchedule(item.id, {
        day: item.day,
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        title: item.title,
        location: item.location,
      });
      setToast({ type: 'success', message: '일정을 저장했습니다.' });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors((prev) => ({ ...prev, [item.id]: error.fieldErrors as ScheduleFieldErrors }));
      }
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '일정 저장에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.deleteSchedule(id);
      await loadSchedules();
      setToast({ type: 'success', message: '일정을 삭제했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '일정 삭제에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const grouped = useMemo(() => {
    return schedules.reduce<Record<string, ScheduleItemResponse[]>>((acc, item) => {
      if (!acc[item.day]) {
        acc[item.day] = [];
      }
      acc[item.day].push(item);
      return acc;
    }, {});
  }, [schedules]);

  const dayEntries = Object.entries(grouped);
  const hasSchedules = dayEntries.length > 0;

  return (
    <AdminScreen
      title="일정 관리"
      subtitle="행사 일정 관리"
      action={
        <button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50" disabled>
          공지 발송
        </button>
      }
    >
      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      <div className="space-y-6">
        {!hasSchedules ? (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">등록된 일정이 없습니다.</p>
            <p className="mt-1 text-xs text-slate-500">아래 버튼으로 첫 일정을 추가하세요.</p>
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                disabled={submitting}
                onClick={() => {
                  void handleCreate('1일차');
                }}
              >
                1일차 추가
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                disabled={submitting}
                onClick={() => {
                  void handleCreate('2일차');
                }}
              >
                2일차 추가
              </button>
            </div>
          </section>
        ) : null}
        {dayEntries.map(([day, items]) => (
          <section key={day} className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold text-primary">{day}</h2>
              <button
                type="button"
                className="text-xs font-semibold text-primary"
                disabled={submitting}
                onClick={() => {
                  void handleCreate(day);
                }}
              >
                + 이벤트 추가
              </button>
            </div>

            {items.map((item) => {
              const rowErrors = fieldErrors[item.id] ?? {};

              return (
                <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={`rounded-lg border px-2 py-2 text-xs ${
                        rowErrors.startsAt ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                      }`}
                      value={item.startsAt}
                      disabled={submitting}
                      onChange={(event) => {
                        clearFieldError(item.id, 'startsAt');
                        setSchedules((prev) =>
                          prev.map((schedule) =>
                            schedule.id === item.id ? { ...schedule, startsAt: event.target.value } : schedule,
                          ),
                        );
                      }}
                    />
                    <input
                      className={`rounded-lg border px-2 py-2 text-xs ${
                        rowErrors.endsAt ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                      }`}
                      value={item.endsAt}
                      disabled={submitting}
                      onChange={(event) => {
                        clearFieldError(item.id, 'endsAt');
                        setSchedules((prev) =>
                          prev.map((schedule) =>
                            schedule.id === item.id ? { ...schedule, endsAt: event.target.value } : schedule,
                          ),
                        );
                      }}
                    />
                  </div>
                  {rowErrors.startsAt || rowErrors.endsAt ? (
                    <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.startsAt ?? rowErrors.endsAt}</p>
                  ) : null}
                  <input
                    className={`mt-2 w-full rounded-lg border px-2 py-2 text-xs ${
                      rowErrors.title ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                    }`}
                    value={item.title}
                    disabled={submitting}
                    onChange={(event) => {
                      clearFieldError(item.id, 'title');
                      setSchedules((prev) =>
                        prev.map((schedule) =>
                          schedule.id === item.id ? { ...schedule, title: event.target.value } : schedule,
                        ),
                      );
                    }}
                  />
                  {rowErrors.title ? <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.title}</p> : null}
                  <input
                    className={`mt-2 w-full rounded-lg border px-2 py-2 text-xs ${
                      rowErrors.location ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                    }`}
                    value={item.location}
                    disabled={submitting}
                    onChange={(event) => {
                      clearFieldError(item.id, 'location');
                      setSchedules((prev) =>
                        prev.map((schedule) =>
                          schedule.id === item.id ? { ...schedule, location: event.target.value } : schedule,
                        ),
                      );
                    }}
                  />
                  {rowErrors.location ? (
                    <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.location}</p>
                  ) : null}
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                      disabled={submitting}
                      onClick={() => {
                        void handleSave(item);
                      }}
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                      disabled={submitting}
                      onClick={() => {
                        void handleDelete(item.id);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </AdminScreen>
  );
}
