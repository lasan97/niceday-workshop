export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-slate-50 px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Nice Day Login</h1>
        <p className="mt-2 text-sm text-slate-500">워크샵 참가를 위해 로그인하세요.</p>
        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="사번"
            type="text"
          />
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="비밀번호"
            type="password"
          />
          <button className="w-full rounded-lg bg-primary py-2 font-semibold text-white" type="button">
            로그인
          </button>
        </div>
      </section>
    </main>
  );
}
