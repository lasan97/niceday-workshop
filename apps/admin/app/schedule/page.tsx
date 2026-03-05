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

function ScheduleBlock({ day, items }: { day: string; items: ScheduleItemResponse[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-sm font-bold text-primary">{day}</h2>
        <button className="text-xs font-semibold text-primary" type="button">
          + 이벤트 추가
        </button>
      </div>

      {items.map((item) => (
        <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-lg border border-slate-300 px-2 py-2 text-xs" defaultValue={item.startsAt} />
            <input className="rounded-lg border border-slate-300 px-2 py-2 text-xs" defaultValue={item.endsAt} />
          </div>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
            defaultValue={item.title}
          />
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
            defaultValue={item.location}
          />
        </article>
      ))}
    </section>
  );
}

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItemResponse[]>(fallbackSchedules);

  useEffect(() => {
    async function load() {
      try {
        const data = await workshopApi.getSchedules();
        setSchedules(data);
      } catch {
        // API 연결 실패 시 fallback 데이터를 유지한다.
      }
    }

    void load();
  }, []);

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
      <div className="space-y-6">
        {Object.entries(grouped).map(([day, items]) => (
          <ScheduleBlock key={day} day={day} items={items} />
        ))}
      </div>
    </AdminScreen>
  );
}
