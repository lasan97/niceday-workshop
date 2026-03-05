'use client';

import { ClientScreen } from '../components/ClientScreen';

const missions = [
  { title: 'Gyeongpo Beach Snap', point: '+200', done: false },
  { title: 'Team Slogan Shout', point: '+150', done: true },
  { title: 'Local Delicacy Hunt', point: '+300', done: false },
];

export default function MissionsPage() {
  return (
    <ClientScreen title="Team Building Missions" subtitle="Current Leaderboard">
      <section className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-bold text-slate-900">1st Team Awesome · 1450 pts</p>
        <p className="mt-1 text-sm text-primary">2nd Nice Explorers (YOU) · 1200 pts</p>
      </section>

      <section className="space-y-3 pb-4">
        {missions.map((mission) => (
          <article
            key={mission.title}
            className={
              mission.done
                ? 'rounded-xl border border-slate-200 bg-slate-100 p-4 opacity-70'
                : 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{mission.title}</h3>
                <p className="mt-1 text-xs text-slate-500">보상 {mission.point}</p>
              </div>
              {mission.done ? (
                <span className="rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white">DONE</span>
              ) : (
                <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white" type="button">
                  Verify
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </ClientScreen>
  );
}
