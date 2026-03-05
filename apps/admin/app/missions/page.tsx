'use client';

import { AdminScreen } from '../components/AdminScreen';

const missionItems = [
  { title: 'Find the Hidden Treasure', points: 50, active: true },
  { title: 'Group Pyramid Photo', points: 30, active: true },
  { title: 'Coffee Break Trivia', points: 10, active: false },
];

const pending = [
  { team: 'Team Alpha', mission: 'Group Pyramid Photo' },
  { team: 'Team Bravo', mission: 'Find the Hidden Treasure' },
];

export default function AdminMissionsPage() {
  return (
    <AdminScreen
      title="Mission Management"
      subtitle="Current Missions and Photo Submissions"
      action={<button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">+ Add</button>}
    >
      <section className="space-y-3">
        {missionItems.map((mission) => (
          <article
            key={mission.title}
            className={
              mission.active
                ? 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
                : 'rounded-xl border border-slate-200 bg-slate-100 p-4 opacity-70'
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{mission.title}</h2>
                <p className="text-xs text-slate-500">{mission.points} Points</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                Active
                <input defaultChecked={mission.active} type="checkbox" />
              </label>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <button className="rounded-md border border-slate-200 py-1.5 text-xs font-semibold">Edit</button>
              <button className="rounded-md border border-red-200 bg-red-50 py-1.5 text-xs font-semibold text-red-600">
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">Photo Submissions</h3>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">3 Pending</span>
        </div>
        <div className="space-y-2">
          {pending.map((item) => (
            <article key={`${item.team}-${item.mission}`} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-sm font-bold text-slate-900">{item.team}</p>
              <p className="text-xs text-slate-500">{item.mission}</p>
              <div className="mt-2 flex gap-2">
                <button className="flex-1 rounded-md bg-primary py-1.5 text-xs font-semibold text-white">Approve</button>
                <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminScreen>
  );
}
