'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { OverviewResponse, SessionResponse } from '@workshop/types';
import { workshopApi } from '../lib/workshop-api';
import { ClientBottomNav } from './components/ClientBottomNav';

const fallbackOverview: OverviewResponse = {
  activeMissions: 12,
  upcomingSessions: 8,
  totalUsers: 150,
  totalSchedules: 5,
  pendingSubmissions: 3,
};

const fallbackSession: SessionResponse = {
  id: 'ses-local',
  team: 'TEAM ALPHA',
  title: 'Beachside Relay Race',
  speaker: 'Field Host',
  room: 'Gyeongpo Beach',
  liveQa: true,
  pendingQuestions: 0,
};

export default function ClientHomePage() {
  const [overview, setOverview] = useState<OverviewResponse>(fallbackOverview);
  const [currentSession, setCurrentSession] = useState<SessionResponse>(fallbackSession);

  useEffect(() => {
    async function load() {
      try {
        const [overviewData, sessions] = await Promise.all([
          workshopApi.getOverview(),
          workshopApi.getSessions(),
        ]);
        setOverview(overviewData);
        if (sessions.length > 0) {
          setCurrentSession(sessions[0]);
        }
      } catch {
        // API 연결 실패 시 fallback 데이터를 유지한다.
      }
    }

    void load();
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-100 pb-20 shadow-xl">
      <header className="flex items-center justify-between px-4 pb-2 pt-5">
        <div>
          <p className="text-xs font-medium text-slate-500">Gangneung</p>
          <p className="text-sm font-bold text-slate-900">24C</p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">LIVE</div>
      </header>

      <section className="px-4 pb-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-primary to-cyan-500 p-6 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Day 1</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">Nice Day Gangneung Workshop</h1>
          <p className="mt-2 text-sm text-white/80">Refresh and Reconnect</p>
        </div>
      </section>

      <section className="px-4 py-2">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Current Session</h2>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-red-500">In Progress</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">{currentSession.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{currentSession.room}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-primary" />
          </div>
        </article>
      </section>

      <section className="px-4 py-4">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Quick Access</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/schedule" className="rounded-xl bg-primary/10 p-4">
            <p className="text-sm font-bold text-slate-900">Today Schedule</p>
            <p className="mt-1 text-xs text-slate-500">{overview.totalSchedules} schedule blocks</p>
          </Link>
          <Link href="/sessions" className="rounded-xl bg-primary/10 p-4">
            <p className="text-sm font-bold text-slate-900">Team Conference</p>
            <p className="mt-1 text-xs text-slate-500">{overview.upcomingSessions} sessions upcoming</p>
          </Link>
          <Link href="/missions" className="col-span-2 rounded-xl bg-primary/10 p-4">
            <p className="text-sm font-bold text-slate-900">Team Mission</p>
            <p className="mt-1 text-xs text-slate-500">{overview.activeMissions} missions active</p>
          </Link>
        </div>
      </section>

      <ClientBottomNav />
    </main>
  );
}
