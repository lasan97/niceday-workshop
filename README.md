# workshop-2026

워크샵 운영/참가자 경험을 위한 모노레포입니다.

## 구조

- `apps/client`: 참가자용 Next.js 앱
- `apps/admin`: 운영진용 Next.js 앱
- `apps/server`: Spring Boot + PostgreSQL 서버
- `packages/ui`: 공통 UI 컴포넌트
- `packages/types`: 공통 타입
- `packages/config`: 공통 설정

## 빠른 시작

### 1) 프론트엔드

```bash
pnpm install
pnpm dev
```

- client: <http://localhost:3000>
- admin: <http://localhost:3001>

### 2) 서버

```bash
cd apps/server
gradle bootRun
```

기본 포트: `8080`

### 3) PostgreSQL (선택)

```bash
docker compose up -d
```

## 다음 작업 권장

1. `docs` HTML을 React 컴포넌트로 단계적으로 이관
2. OpenAPI 기반 타입 생성 파이프라인 추가
3. 인증/권한(참가자, 운영진) 분리
