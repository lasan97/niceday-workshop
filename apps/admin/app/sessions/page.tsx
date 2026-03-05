'use client';

import { AdminScreen } from '../components/AdminScreen';

const sessionItems = [
  {
    team: 'TEAM ALPHA',
    title: 'The Future of AI in the Workplace',
    speaker: 'Jane Doe',
    room: 'Grand Hall A',
    pending: 5,
    live: true,
  },
  {
    team: 'TEAM BETA',
    title: 'Sustainable Event Management',
    speaker: 'Michael Smith',
    room: 'Ocean Room 2',
    pending: 0,
    live: false,
  },
  {
    team: 'TEAM GAMMA',
    title: 'Scaling Up Microservices',
    speaker: 'Sarah Connor',
    room: 'Grand Hall B',
    pending: 12,
    live: true,
  },
];

export default function AdminSessionsPage() {
  return (
    <AdminScreen
      title="Session Management"
      subtitle="Conference Presentations"
      action={<button className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white">+ Add</button>}
    >
      <div className="space-y-3">
        {sessionItems.map((item) => (
          <article key={item.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <span className="rounded bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{item.team}</span>
              <h2 className="mt-2 text-sm font-bold text-slate-900">{item.title}</h2>
              <p className="mt-1 text-xs text-slate-500">Speaker: {item.speaker}</p>
              <p className="text-xs text-slate-500">Room: {item.room}</p>
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input defaultChecked={item.live} type="checkbox" />
                Live Q and A
              </label>
              <span
                className={
                  item.pending > 0
                    ? 'rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600'
                    : 'rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500'
                }
              >
                {item.pending} Pending
              </span>
            </div>
          </article>
        ))}
      </div>
    </AdminScreen>
  );
}
