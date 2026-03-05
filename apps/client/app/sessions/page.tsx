'use client';

import { ClientScreen } from '../components/ClientScreen';

const sessions = [
  { title: 'Innovating with AI in Design', room: 'Room 101', meta: 'Team Alpha · Speaker Jane Doe' },
  { title: 'Future of Remote Work', room: 'Room 102', meta: 'Team Beta · Speaker John Smith' },
  { title: 'Sustainable Growth Strategies', room: 'Room 201', meta: 'Team Gamma · Speaker Sarah Lee' },
];

export default function SessionsPage() {
  return (
    <ClientScreen title="Team Conference" subtitle="Gangneung Convention Center">
      <div className="space-y-3 pb-4">
        {sessions.map((session) => (
          <article key={session.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4">
              <h3 className="text-sm font-bold text-slate-900">{session.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{session.room}</p>
              <p className="text-xs text-slate-500">{session.meta}</p>
            </div>
            <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
              <button className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white" type="button">
                Ask Question
              </button>
              <button className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700" type="button">
                Feedback
              </button>
            </div>
          </article>
        ))}
      </div>
    </ClientScreen>
  );
}
