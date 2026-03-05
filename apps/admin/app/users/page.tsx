'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TeamResponse, UserResponse } from '@workshop/types';
import { ApiRequestError, workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';
import { Toast } from '../components/Toast';

type UserRow = UserResponse;
type UserForm = {
  id: string | null;
  username: string;
  name: string;
  team: string;
  workshopTeamId: string | null;
  role: string;
};

type UserFieldKey = 'username' | 'name' | 'team' | 'workshopTeamId' | 'role';
type UserFieldErrors = Partial<Record<UserFieldKey, string>>;
type ToastState = { type: 'success' | 'error'; message: string } | null;

const emptyForm: UserForm = {
  id: null,
  username: '',
  name: '',
  team: '',
  workshopTeamId: null,
  role: 'PARTICIPANT',
};

const fallbackUsers: UserRow[] = [
  {
    id: 'usr-local-1',
    username: 'user01',
    name: '홍길동',
    team: '알파팀',
    workshopTeamId: 'team-alpha',
    workshopTeamName: '알파팀',
    department: '',
    role: 'PARTICIPANT',
  },
];

const fallbackTeams: TeamResponse[] = [
  { id: 'team-alpha', name: '알파팀' },
  { id: 'team-beta', name: '베타팀' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>(fallbackUsers);
  const [teams, setTeams] = useState<TeamResponse[]>(fallbackTeams);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [search, setSearch] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<UserFieldErrors>({});

  async function loadUsers() {
    try {
      const data = await workshopApi.getUsers();
      setUsers(data);
    } catch {
      setToast({ type: 'error', message: '사용자 조회에 실패했습니다. 로컬 데이터를 표시합니다.' });
    }
  }

  async function loadTeams() {
    try {
      const data = await workshopApi.getTeams();
      setTeams(data);
    } catch {
      setToast({ type: 'error', message: '워크샵 팀 조회에 실패했습니다.' });
    }
  }

  useEffect(() => {
    void Promise.all([loadUsers(), loadTeams()]);
  }, []);

  function openCreateModal() {
    setFieldErrors({});
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(user: UserRow) {
    setFieldErrors({});
    setForm({
      id: user.id,
      username: user.username,
      name: user.name,
      team: user.team,
      workshopTeamId: user.workshopTeamId ?? null,
      role: user.role,
    });
    setModalOpen(true);
  }

  function validateForm(): boolean {
    const errors: UserFieldErrors = {};

    if (!form.username.trim()) {
      errors.username = '아이디를 입력해주세요.';
    }
    if (!form.name.trim()) {
      errors.name = '이름을 입력해주세요.';
    }
    if (!form.team.trim()) {
      errors.team = '팀을 입력해주세요.';
    }
    if (!form.role.trim()) {
      errors.role = '권한을 선택해주세요.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSaveUser() {
    if (submitting || !validateForm()) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      const payload = {
        username: form.username,
        name: form.name,
        team: form.team,
        workshopTeamId: form.workshopTeamId,
        role: form.role,
      };

      if (form.id) {
        await workshopApi.updateUser(form.id, payload);
        setToast({ type: 'success', message: '사용자 정보를 저장했습니다.' });
      } else {
        await workshopApi.createUser(payload);
        setToast({ type: 'success', message: '사용자를 추가했습니다. 초기 비밀번호는 1111 입니다.' });
      }

      setModalOpen(false);
      await loadUsers();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors(error.fieldErrors as UserFieldErrors);
      }
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '사용자 저장에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.deleteUser(userId);
      await loadUsers();
      setToast({ type: 'success', message: '사용자를 삭제했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '사용자 삭제에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(userId: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.resetUserPassword(userId);
      setToast({ type: 'success', message: '비밀번호를 1111로 초기화했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '비밀번호 초기화에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateTeam() {
    if (submitting || !newTeamName.trim()) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.createTeam({ name: newTeamName.trim() });
      setNewTeamName('');
      await loadTeams();
      setToast({ type: 'success', message: '워크샵 팀을 추가했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '워크샵 팀 추가에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveTeam(team: TeamResponse) {
    if (submitting || !team.name.trim()) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.updateTeam(team.id, { name: team.name.trim() });
      await Promise.all([loadTeams(), loadUsers()]);
      setToast({ type: 'success', message: '워크샵 팀을 저장했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '워크샵 팀 저장에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTeam(teamId: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.deleteTeam(teamId);
      await Promise.all([loadTeams(), loadUsers()]);
      setToast({ type: 'success', message: '워크샵 팀을 삭제했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '워크샵 팀 삭제에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const filteredUsers = useMemo(() => {
    if (!search.trim()) {
      return users;
    }

    const keyword = search.trim();
    return users.filter((user) => `${user.username}${user.name}${user.team}${user.workshopTeamName ?? ''}`.includes(keyword));
  }, [search, users]);

  return (
    <AdminScreen
      title="사용자 관리"
      subtitle={`총 ${users.length}명 사용자`}
      action={
        <button
          type="button"
          className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          disabled={submitting}
          onClick={openCreateModal}
        >
          + 사용자
        </button>
      }
    >
      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}

      <div className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-xs font-bold text-slate-700">워크샵 팀 관리</h2>
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-300 px-2 py-2 text-xs"
              placeholder="새 워크샵 팀 이름"
              value={newTeamName}
              disabled={submitting}
              onChange={(event) => setNewTeamName(event.target.value)}
            />
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
              disabled={submitting}
              onClick={() => {
                void handleCreateTeam();
              }}
            >
              추가
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-2">
                <input
                  className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                  value={team.name}
                  disabled={submitting}
                  onChange={(event) => {
                    setTeams((prev) =>
                      prev.map((item) => (item.id === team.id ? { ...item, name: event.target.value } : item)),
                    );
                  }}
                />
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 py-1 text-[10px] font-semibold"
                  disabled={submitting}
                  onClick={() => {
                    void handleSaveTeam(team);
                  }}
                >
                  저장
                </button>
                <button
                  type="button"
                  className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600"
                  disabled={submitting}
                  onClick={() => {
                    void handleDeleteTeam(team.id);
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="아이디/이름/팀 검색"
            value={search}
            disabled={submitting}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <article key={user.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{user.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">@{user.username}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      팀: {user.team} · 워크샵팀: {user.workshopTeamName ?? '미배정'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">권한: {user.role === 'ADMIN' ? '관리자' : '참가자'}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold"
                  disabled={submitting}
                  onClick={() => openEditModal(user)}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="rounded-md border border-amber-200 bg-amber-50 py-1 text-[10px] font-semibold text-amber-700 disabled:opacity-50"
                  disabled={submitting}
                  onClick={() => {
                    void handleResetPassword(user.id);
                  }}
                >
                  비번초기화
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-200 bg-red-50 py-1 text-[10px] font-semibold text-red-600"
                  disabled={submitting}
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

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">{form.id ? '사용자 수정' : '사용자 추가'}</h3>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setModalOpen(false)}
              >
                닫기
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-[10px] font-semibold text-slate-500">아이디</label>
              <input
                className={`w-full rounded border px-2 py-2 text-xs ${
                  fieldErrors.username ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={form.username}
                disabled={submitting}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, username: undefined }));
                  setForm((prev) => ({ ...prev, username: event.target.value }));
                }}
              />
              {fieldErrors.username ? (
                <p className="text-[10px] font-semibold text-red-600">{fieldErrors.username}</p>
              ) : null}

              <label className="text-[10px] font-semibold text-slate-500">이름</label>
              <input
                className={`w-full rounded border px-2 py-2 text-xs ${
                  fieldErrors.name ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={form.name}
                disabled={submitting}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  setForm((prev) => ({ ...prev, name: event.target.value }));
                }}
              />
              {fieldErrors.name ? <p className="text-[10px] font-semibold text-red-600">{fieldErrors.name}</p> : null}

              <label className="text-[10px] font-semibold text-slate-500">팀</label>
              <input
                className={`w-full rounded border px-2 py-2 text-xs ${
                  fieldErrors.team ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={form.team}
                disabled={submitting}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, team: undefined }));
                  setForm((prev) => ({ ...prev, team: event.target.value }));
                }}
              />
              {fieldErrors.team ? <p className="text-[10px] font-semibold text-red-600">{fieldErrors.team}</p> : null}

              <label className="text-[10px] font-semibold text-slate-500">워크샵 팀</label>
              <select
                className="w-full rounded border border-slate-300 px-2 py-2 text-xs"
                value={form.workshopTeamId ?? ''}
                disabled={submitting}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, workshopTeamId: event.target.value || null }));
                }}
              >
                <option value="">미배정</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>

              <label className="text-[10px] font-semibold text-slate-500">권한</label>
              <select
                className={`w-full rounded border px-2 py-2 text-xs ${
                  fieldErrors.role ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={form.role}
                disabled={submitting}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, role: undefined }));
                  setForm((prev) => ({ ...prev, role: event.target.value }));
                }}
              >
                <option value="PARTICIPANT">참가자</option>
                <option value="ADMIN">관리자</option>
              </select>
              {fieldErrors.role ? <p className="text-[10px] font-semibold text-red-600">{fieldErrors.role}</p> : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 py-2 text-xs font-semibold text-slate-700"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                취소
              </button>
              <button
                type="button"
                className="rounded-md bg-primary py-2 text-xs font-semibold text-white disabled:opacity-50"
                onClick={() => {
                  void handleSaveUser();
                }}
                disabled={submitting}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminScreen>
  );
}
