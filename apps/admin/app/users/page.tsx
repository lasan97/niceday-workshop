'use client';

import { useEffect, useState } from 'react';
import type { UserResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';

const fallbackUsers: UserResponse[] = [
  { id: 'usr-local-1', name: '홍길동', team: '알파팀', department: '제품팀', role: 'PARTICIPANT' },
  { id: 'usr-local-2', name: '김수진', team: '베타팀', department: '마케팅팀', role: 'PARTICIPANT' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>(fallbackUsers);

  useEffect(() => {
    async function load() {
      try {
        const data = await workshopApi.getUsers();
        setUsers(data);
      } catch {
        // API 연결 실패 시 fallback 데이터를 유지한다.
      }
    }

    void load();
  }, []);

  return (
    <AdminScreen
      title="사용자 관리"
      subtitle={`총 ${users.length}명 참가자`}
      action={<button className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white">+ 사용자</button>}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="이름 또는 팀으로 검색..."
          />
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <article key={user.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <h3 className="text-sm font-bold text-slate-900">{user.name}</h3>
                    <p className="text-xs text-slate-500">
                      {user.team} · {user.department} · {user.role === 'ADMIN' ? '관리자' : '참가자'}
                    </p>
              </div>
              <div className="grid grid-cols-4 gap-2 bg-slate-50 px-4 py-3">
                <button className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold">팀</button>
                <button className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold">권한</button>
                <button className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold">비번</button>
                <button className="rounded-md border border-red-200 bg-red-50 py-1 text-[10px] font-semibold text-red-600">
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminScreen>
  );
}
