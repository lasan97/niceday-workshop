'use client';

import { AdminScreen } from '../components/AdminScreen';

const users = [
  { name: 'John Doe', team: 'Team Alpha', dept: 'Product', initials: 'JD' },
  { name: 'Sarah Jenkins', team: 'Team Beta', dept: 'Marketing', initials: 'SJ' },
  { name: 'Michael Kim', team: 'Unassigned', dept: 'Engineering', initials: 'MK' },
  { name: 'Emily Park', team: 'Team Gamma', dept: 'Sales', initials: 'EP' },
];

export default function AdminUsersPage() {
  return (
    <AdminScreen
      title="User Management"
      subtitle="150 Attendees Total"
      action={<button className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white">+ User</button>}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Search by name or team..."
          />
          <div className="mt-2 flex justify-end">
            <button className="text-xs font-semibold text-primary" type="button">
              Export CSV
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <article key={user.name} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {user.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{user.name}</h3>
                    <p className="text-xs text-slate-500">
                      {user.team} · {user.dept}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 bg-slate-50 px-4 py-3">
                <button className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold">Team</button>
                <button className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold">Role</button>
                <button className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold">PW</button>
                <button className="rounded-md border border-red-200 bg-red-50 py-1 text-[10px] font-semibold text-red-600">
                  Del
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminScreen>
  );
}
