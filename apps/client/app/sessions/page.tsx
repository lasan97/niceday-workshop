'use client';

import { AppCard } from '@workshop/ui';
import { ClientScreen } from '../components/ClientScreen';

const sessions = [
  { title: 'Innovating with AI', room: 'Room 101' },
  { title: 'Future of Remote Work', room: 'Room 102' },
  { title: 'Sustainable Growth', room: 'Room 201' },
];

export default function SessionsPage() {
  return (
    <ClientScreen title="팀 컨퍼런스" subtitle="질문/피드백 참여">
      <div className="space-y-3">
        {sessions.map((session) => (
          <AppCard
            key={session.title}
            title={session.title}
            description={session.room}
            action={
              <div className="flex gap-2">
                <button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white" type="button">
                  질문하기
                </button>
                <button
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  type="button"
                >
                  피드백
                </button>
              </div>
            }
          />
        ))}
      </div>
    </ClientScreen>
  );
}
