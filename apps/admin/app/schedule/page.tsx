'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ScheduleItemResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';

const fallbackSchedules: ScheduleItemResponse[] = [
  {
    id: 'sch-local-1',
    day: 'DAY_1',
    startsAt: '09:00',
    endsAt: '10:30',
    title: 'Registration and Welcome',
    location: 'Grand Lobby',
  },
  {
    id: 'sch-local-2',
    day: 'DAY_2',
    startsAt: '09:00',
    endsAt: '12:00',
    title: 'Team Building Mission',
    location: 'Gangneung Beach',
  },
];

function ScheduleBlock({ day, items }: { day: string; items: ScheduleItemResponse[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-sm font-bold text-primary">{day}</h2>
        <button className="text-xs font-semibold text-primary" type="button">
          + Add Event
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
      title="Schedule Management"
      subtitle="Event Itinerary"
      action={<button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">Broadcast</button>}
    >
      <div className="space-y-6">
        {Object.entries(grouped).map(([day, items]) => (
          <ScheduleBlock key={day} day={day} items={items} />
        ))}
      </div>
    </AdminScreen>
  );
}
