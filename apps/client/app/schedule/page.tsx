'use client';

import { useEffect, useState } from 'react';
import type { ScheduleItemResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { ClientScreen } from '../components/ClientScreen';

const fallbackTimeline: ScheduleItemResponse[] = [
  {
    id: 'sch-local-1',
    day: '1일차',
    startsAt: '10:00',
    endsAt: '11:00',
    title: '강릉 도착',
    location: '버스 터미널',
  },
  {
    id: 'sch-local-2',
    day: '1일차',
    startsAt: '12:30',
    endsAt: '13:30',
    title: '점심 식사',
    location: '지역 식당',
  },
];

export default function SchedulePage() {
  const [timeline, setTimeline] = useState<ScheduleItemResponse[]>(fallbackTimeline);

  useEffect(() => {
    async function load() {
      try {
        const data = await workshopApi.getSchedules();
        setTimeline(data);
      } catch {
        // API 연결 실패 시 fallback 데이터를 유지한다.
      }
    }

    void load();
  }, []);

  return (
    <ClientScreen title="워크샵 타임라인" subtitle="목요일 · 1일차">
      <div className="space-y-4 pb-4">
        {timeline.map((item) => (
          <article key={item.id} className="grid grid-cols-[40px_1fr] gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              ●
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {item.startsAt} - {item.endsAt}
              </p>
              <p className="text-xs text-slate-500">{item.location}</p>
            </div>
          </article>
        ))}
      </div>
    </ClientScreen>
  );
}
