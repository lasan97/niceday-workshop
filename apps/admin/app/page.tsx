'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { OverviewResponse } from '@workshop/types';
import { workshopApi } from '../lib/workshop-api';
import { AdminScreen } from './components/AdminScreen';

const fallbackOverview: OverviewResponse = {
  activeMissions: 12,
  upcomingSessions: 8,
  totalUsers: 150,
  totalSchedules: 5,
  pendingSubmissions: 3,
};

export default function AdminHomePage() {
  const [overview, setOverview] = useState<OverviewResponse>(fallbackOverview);

  useEffect(() => {
    async function load() {
      try {
        const data = await workshopApi.getOverview();
        setOverview(data);
      } catch {
        // API 연결 실패 시 fallback 데이터를 유지한다.
      }
    }

    void load();
  }, []);

  const stats = [
    { title: 'Active Missions', value: String(overview.activeMissions), note: 'Includes all active campaigns' },
    { title: 'Upcoming Sessions', value: String(overview.upcomingSessions), note: 'Next in 2h' },
    { title: 'Total Users', value: String(overview.totalUsers), note: 'Checked-in attendees included' },
    { title: 'Schedules', value: String(overview.totalSchedules), note: 'Today and tomorrow blocks' },
  ];

  const modules = [
    { href: '/schedule', title: 'Schedule Management', desc: 'Manage daily events and timing' },
    { href: '/missions', title: 'Mission Management', desc: 'Approve and track team missions' },
    { href: '/sessions', title: 'Conference Sessions', desc: 'Manage speakers and Q and A' },
    { href: '/users', title: 'User Management', desc: 'Handle attendee access and teams' },
  ];

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
