'use client';

import { AdminScreen } from '../components/AdminScreen';

const day1 = [
  { start: '09:00', end: '10:30', title: 'Registration and Welcome', location: 'Grand Lobby' },
  { start: '10:30', end: '12:30', title: 'Keynote: Future Vision', location: 'Main Hall A' },
];

const day2 = [{ start: '09:00', end: '12:00', title: 'Team Building Mission', location: 'Gangneung Beach' }];

function ScheduleBlock({ day, items }: { day: string; items: typeof day1 }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-sm font-bold text-primary">{day}</h2>
        <button className="text-xs font-semibold text-primary" type="button">
          + Add Event
        </button>
      </div>

      {items.map((item) => (
        <article key={`${day}-${item.title}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-lg border border-slate-300 px-2 py-2 text-xs" defaultValue={item.start} />
            <input className="rounded-lg border border-slate-300 px-2 py-2 text-xs" defaultValue={item.end} />
          </div>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
            defaultValue={item.title}
          />
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
            defaultValue={item.location}
          />
          <div className="mt-2 flex justify-end">
            <button className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600" type="button">
              Delete
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

export default function AdminSchedulePage() {
  return (
    <AdminScreen
      title="Schedule Management"
      subtitle="Event Itinerary"
      action={<button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">Broadcast</button>}
    >
      <div className="space-y-6">
        <ScheduleBlock day="Day 1 - Thursday" items={day1} />
        <ScheduleBlock day="Day 2 - Friday" items={day2} />
      </div>
    </AdminScreen>
  );
}
