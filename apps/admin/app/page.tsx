import { AppCard } from '@workshop/ui';

export default function AdminHomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      <h1 className="mb-4 text-2xl font-bold">워크샵 운영 대시보드</h1>
      <AppCard
        title="관리자 화면 이관 준비 완료"
        description="docs/admin_* 화면을 단계적으로 Next.js 라우트로 이동하세요."
      />
    </main>
  );
}
