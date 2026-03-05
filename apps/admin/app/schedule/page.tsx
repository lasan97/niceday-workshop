'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ScheduleItemResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';

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

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItemResponse[]>(fallbackSchedules);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  async function loadSchedules() {
    try {
      const data = await workshopApi.getSchedules();
      setSchedules(data);
    } catch {
      setNotice('일정 조회에 실패했습니다.');
    }
  }

  useEffect(() => {
    void loadSchedules();
  }, []);

  async function handleCreate(day: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    try {
      await workshopApi.createSchedule({
        day,
        startsAt: '09:00',
        endsAt: '10:00',
        title: '새 일정',
        location: '장소 입력',
      });
      await loadSchedules();
      setNotice('일정을 추가했습니다.');
    } catch {
      setNotice('일정 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave(item: ScheduleItemResponse) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    try {
      await workshopApi.updateSchedule(item.id, {
        day: item.day,
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        title: item.title,
        location: item.location,
      });
      setNotice('일정을 저장했습니다.');
    } catch {
      setNotice('일정 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    try {
      await workshopApi.deleteSchedule(id);
      await loadSchedules();
      setNotice('일정을 삭제했습니다.');
    } catch {
      setNotice('일정 삭제에 실패했습니다.');
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

  return (
    <AdminScreen
      title="일정 관리"
      subtitle="행사 일정 관리"
      action={<button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">공지 발송</button>}
    >
      {notice ? <p className="mb-3 text-xs font-semibold text-slate-600">{notice}</p> : null}
      <div className="space-y-6">
        {Object.entries(grouped).map(([day, items]) => (
          <section key={day} className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold text-primary">{day}</h2>
              <button
                type="button"
                className="text-xs font-semibold text-primary"
                onClick={() => {
                  void handleCreate(day);
                }}
              >
                + 이벤트 추가
              </button>
            </div>

            {items.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="rounded-lg border border-slate-300 px-2 py-2 text-xs"
                    value={item.startsAt}
                    onChange={(event) => {
                      setSchedules((prev) =>
                        prev.map((schedule) =>
                          schedule.id === item.id ? { ...schedule, startsAt: event.target.value } : schedule,
                        ),
                      );
                    }}
                  />
                  <input
                    className="rounded-lg border border-slate-300 px-2 py-2 text-xs"
                    value={item.endsAt}
                    onChange={(event) => {
                      setSchedules((prev) =>
                        prev.map((schedule) =>
                          schedule.id === item.id ? { ...schedule, endsAt: event.target.value } : schedule,
                        ),
                      );
                    }}
                  />
                </div>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
                  value={item.title}
                  onChange={(event) => {
                    setSchedules((prev) =>
                      prev.map((schedule) =>
                        schedule.id === item.id ? { ...schedule, title: event.target.value } : schedule,
                      ),
                    );
                  }}
                />
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
                  value={item.location}
                  onChange={(event) => {
                    setSchedules((prev) =>
                      prev.map((schedule) =>
                        schedule.id === item.id ? { ...schedule, location: event.target.value } : schedule,
                      ),
                    );
                  }}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                    onClick={() => {
                      void handleSave(item);
                    }}
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                    onClick={() => {
                      void handleDelete(item.id);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>
    </AdminScreen>
  );
}
