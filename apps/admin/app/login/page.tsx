'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setError('관리자 계정 정보가 올바르지 않습니다.');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    router.replace(params.get('next') || '/');
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center bg-slate-100 px-6">
      <form className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <h1 className="text-2xl font-bold text-slate-900">관리자 로그인</h1>
        <p className="mt-2 text-sm text-slate-500">운영진 계정으로 로그인하세요.</p>
        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-3"
            placeholder="admin"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-3"
            placeholder="admin1234"
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
