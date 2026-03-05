'use client';

import { useEffect, useState } from 'react';
import type { ScheduleItemResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { ClientScreen } from '../components/ClientScreen';

const fallbackTimeline: ScheduleItemResponse[] = [
  {
    id: 'sch-local-1',
    day: 'DAY_1',
    startsAt: '10:00',
    endsAt: '11:00',
    title: 'Arrival at Gangneung',
    location: 'Bus Terminal',
  },
  {
    id: 'sch-local-2',
    day: 'DAY_1',
    startsAt: '12:30',
    endsAt: '13:30',
    title: 'Lunch',
    location: 'Local Restaurant',
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
    <ClientScreen title="Workshop Timeline" subtitle="Thursday, Day 1">
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
