'use client';

import { AppCard } from '@workshop/ui';
import { ClientScreen } from '../components/ClientScreen';

const schedule = [
  { time: '10:00', title: '강릉 도착', place: 'Bus Terminal' },
  { time: '12:30', title: '점심', place: 'Local Restaurant' },
  { time: '14:00', title: '팀 컨퍼런스', place: 'Hall A' },
  { time: '19:00', title: '네트워킹 디너', place: 'Banquet Hall' },
];

export default function SchedulePage() {
  return (
    <ClientScreen title="워크샵 타임라인" subtitle="Day 1 일정">
      <div className="space-y-3">
        {schedule.map((item) => (
          <AppCard
            key={`${item.time}-${item.title}`}
            title={`${item.time} · ${item.title}`}
            description={item.place}
          />
        ))}
      </div>
    </ClientScreen>
  );
}
