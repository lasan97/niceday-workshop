'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ScheduleItemResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { markdownToPlainText, twoLineClampStyle } from '@workshop/ui';
import { PageSpinner } from '../components/PageSpinner';
import { ClientScreen } from '../components/ClientScreen';

type SchedulePeriod = { startDate: string; endDate: string };

function extractDate(value: string): string {
  return value.split('T')[0] ?? '';
}

function extractTime(value: string): string {
  const time = value.split('T')[1] ?? '';
  return time.slice(0, 5);
}

function formatDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(date);
}

export default function SchedulePage() {
  const [timeline, setTimeline] = useState<ScheduleItemResponse[]>([]);
  const [period, setPeriod] = useState<SchedulePeriod | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [schedules, periodData] = await Promise.all([
          workshopApi.getSchedules(),
          workshopApi.getSchedulePeriod(),
        ]);
        setTimeline(schedules);
        setPeriod(periodData);
      } catch {
        setTimeline([]);
        setPeriod(null);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const grouped = useMemo(() => {
    return timeline.reduce<Record<string, ScheduleItemResponse[]>>((acc, item) => {
      const date = extractDate(item.startsAt) || '미정';
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
  }, [timeline]);

  const dayEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  const subtitle = period ? `${period.startDate} ~ ${period.endDate}` : '전체 일정';

  return (
    <ClientScreen title="워크샵 타임라인" subtitle={subtitle}>
      {loading ? <PageSpinner label="일정 정보를 불러오는 중..." /> : null}
      {!loading ? (
        <div className="space-y-5 pb-4">
          {dayEntries.map(([date, items]) => (
            <section key={date} className="space-y-2">
              <h2 className="text-sm font-bold text-slate-700">{formatDateLabel(date)}</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <article key={item.id} className="grid grid-cols-[40px_1fr] gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      ●
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {extractTime(item.startsAt)} - {extractTime(item.endsAt)}
                      </p>
                      <p className="text-xs text-slate-500" style={twoLineClampStyle}>
                        {markdownToPlainText(item.description)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </ClientScreen>
  );
}
