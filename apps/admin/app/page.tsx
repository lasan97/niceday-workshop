'use client';

import Link from 'next/link';
import { AdminScreen } from './components/AdminScreen';

const stats = [
  { title: 'Active Missions', value: '12', note: '+2 from yesterday' },
  { title: 'Upcoming Sessions', value: '8', note: 'Next in 2h' },
  { title: 'Total Users', value: '150', note: '98% check-in' },
  { title: 'Schedules', value: '5', note: 'No changes' },
];

const modules = [
  { href: '/schedule', title: 'Schedule Management', desc: 'Manage daily events and timing' },
  { href: '/missions', title: 'Mission Management', desc: 'Approve and track team missions' },
  { href: '/sessions', title: 'Conference Sessions', desc: 'Manage speakers and Q and A' },
  { href: '/users', title: 'User Management', desc: 'Handle attendee access and teams' },
];

export default function AdminHomePage() {
  return (
    <AdminScreen title="Nice Day Admin" subtitle="Workshop Overview · Gangneung Event Management">
      <section className="mb-5 grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <article key={stat.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{stat.title}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-[11px] text-emerald-600">{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700">Management Modules</h2>
        {modules.map((module) => (
          <Link
            key={module.title}
            href={module.href}
            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-bold text-slate-900">{module.title}</p>
            <p className="mt-1 text-xs text-slate-500">{module.desc}</p>
          </Link>
        ))}
      </section>
    </AdminScreen>
  );
}
