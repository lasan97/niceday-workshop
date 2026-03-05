'use client';

import { useEffect, useMemo, useState } from 'react';
import type { UserResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';

const fallbackUsers: UserResponse[] = [
  { id: 'usr-local-1', name: '홍길동', team: '알파팀', department: '제품팀', role: 'PARTICIPANT' },
  { id: 'usr-local-2', name: '김수진', team: '베타팀', department: '마케팅팀', role: 'PARTICIPANT' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>(fallbackUsers);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');

  async function loadUsers() {
    try {
      const data = await workshopApi.getUsers();
      setUsers(data);
    } catch {
      setNotice('사용자 조회에 실패했습니다.');
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleCreateUser() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    try {
      await workshopApi.createUser({
        name: '신규 사용자',
        team: '미배정',
        department: '부서 입력',
        role: 'PARTICIPANT',
      });
      await loadUsers();
      setNotice('사용자를 추가했습니다.');
    } catch {
      setNotice('사용자 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveUser(user: UserResponse) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    try {
      await workshopApi.updateUser(user.id, {
        name: user.name,
        team: user.team,
        department: user.department,
        role: user.role,
      });
      setNotice('사용자 정보를 저장했습니다.');
    } catch {
      setNotice('사용자 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUser(id: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    try {
      await workshopApi.deleteUser(id);
      await loadUsers();
      setNotice('사용자를 삭제했습니다.');
    } catch {
      setNotice('사용자 삭제에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  const filteredUsers = useMemo(() => {
    if (!search.trim()) {
      return users;
    }
    const keyword = search.trim();
    return users.filter((user) => `${user.name}${user.team}`.includes(keyword));
  }, [search, users]);

  return (
    <AdminScreen
      title="사용자 관리"
      subtitle={`총 ${users.length}명 참가자`}
      action={
        <button
          type="button"
          className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white"
          onClick={() => {
            void handleCreateUser();
          }}
        >
          + 사용자
        </button>
      }
    >
      {notice ? <p className="mb-3 text-xs font-semibold text-slate-600">{notice}</p> : null}
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="이름 또는 팀으로 검색..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <article key={user.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <input
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm font-bold text-slate-900"
                  value={user.name}
                  onChange={(event) => {
                    setUsers((prev) =>
                      prev.map((item) => (item.id === user.id ? { ...item, name: event.target.value } : item)),
                    );
                  }}
                />
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-500"
                  value={user.team}
                  onChange={(event) => {
                    setUsers((prev) =>
                      prev.map((item) => (item.id === user.id ? { ...item, team: event.target.value } : item)),
                    );
                  }}
                />
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-500"
                  value={user.department}
                  onChange={(event) => {
                    setUsers((prev) =>
                      prev.map((item) =>
                        item.id === user.id ? { ...item, department: event.target.value } : item,
                      ),
                    );
                  }}
                />
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-500"
                  value={user.role}
                  onChange={(event) => {
                    setUsers((prev) =>
                      prev.map((item) => (item.id === user.id ? { ...item, role: event.target.value } : item)),
                    );
                  }}
                >
                  <option value="PARTICIPANT">참가자</option>
                  <option value="ADMIN">관리자</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 px-4 py-3">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold"
                  onClick={() => {
                    void handleSaveUser(user);
                  }}
                >
                  저장
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-200 bg-red-50 py-1 text-[10px] font-semibold text-red-600"
                  onClick={() => {
                    void handleDeleteUser(user.id);
                  }}
                >
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
