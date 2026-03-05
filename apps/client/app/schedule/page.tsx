'use client';

import { ClientScreen } from '../components/ClientScreen';

const timeline = [
  { time: '10:00 AM', title: 'Arrival at Gangneung', location: 'Bus Terminal', tone: 'bg-primary/10 text-primary' },
  { time: '12:30 PM', title: 'Lunch', location: 'Local Restaurant', tone: 'bg-orange-100 text-orange-600' },
  {
    time: '02:00 PM - 05:00 PM',
    title: 'Team Conference Part 1',
    location: 'Conference Hall A',
    tone: 'bg-purple-100 text-purple-600',
  },
  { time: '07:00 PM', title: 'Dinner and Networking', location: 'Hotel Banquet', tone: 'bg-emerald-100 text-emerald-600' },
];

export default function SchedulePage() {
  return (
    <ClientScreen title="Workshop Timeline" subtitle="Thursday, Day 1">
      <div className="space-y-4 pb-4">
        {timeline.map((item) => (
          <article key={item.title} className="grid grid-cols-[40px_1fr] gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${item.tone}`}>
              ●
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{item.time}</p>
              <p className="text-xs text-slate-500">{item.location}</p>
            </div>
          </article>
        ))}
      </div>
    </ClientScreen>
  );
}
