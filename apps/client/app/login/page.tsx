export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-gradient-to-b from-blue-50 to-white px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Welcome to Gangneung Workshop</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to access event details and schedules.</p>
        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-3"
            placeholder="Employee ID"
            type="text"
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-3"
            placeholder="Password"
            type="password"
          />
          <button className="w-full rounded-xl bg-primary py-3 font-semibold text-white" type="button">
            Login
          </button>
        </div>
      </section>
    </main>
  );
}
