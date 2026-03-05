'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, password }),
    });

    if (!response.ok) {
      setError('로그인에 실패했습니다.');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    router.replace(params.get('next') || '/');
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-gradient-to-b from-blue-50 to-white px-6">
      <form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <h1 className="text-2xl font-bold text-slate-900">강릉 워크샵에 오신 것을 환영합니다</h1>
        <p className="mt-2 text-sm text-slate-500">일정과 이벤트 정보를 확인하려면 로그인하세요.</p>
        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-3"
            placeholder="사번"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-3"
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}
          <button className="w-full rounded-xl bg-primary py-3 font-semibold text-white" type="submit">
            로그인
          </button>
        </div>
      </form>
    </main>
  );
}
