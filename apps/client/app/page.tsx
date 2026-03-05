import { AppCard } from '@workshop/ui';

export default function ClientHomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">워크샵 참가자 홈</h1>
      <AppCard
        title="다음 단계"
        description="docs 화면을 이 앱의 실제 라우트/컴포넌트로 이관하세요."
      />
    </main>
  );
}
