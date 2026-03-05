'use client';

import { useEffect, useState } from 'react';
import type { ScheduleItemResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { PageSpinner } from '../components/PageSpinner';
import { ClientScreen } from '../components/ClientScreen';

export default function SchedulePage() {
  const [timeline, setTimeline] = useState<ScheduleItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await workshopApi.getSchedules();
        setTimeline(data);
      } catch {
        setTimeline([]);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <ClientScreen title="워크샵 타임라인" subtitle="목요일 · 1일차">
      {loading ? <PageSpinner label="일정 정보를 불러오는 중..." /> : null}
      {!loading ? (
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
      ) : null}
    </ClientScreen>
  );
}
