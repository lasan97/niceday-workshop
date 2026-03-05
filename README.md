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

### 1) 의존성 설치

```bash
pnpm install
```

### 2) 프론트엔드 실행

```bash
pnpm dev
```

- client: <http://localhost:3000>
- admin: <http://localhost:3001>

### 3) 서버 실행

```bash
cd apps/server
./gradlew bootRun
```

- 기본 포트: `8080`
- 기본 프로파일: `dev` (PostgreSQL)
- Flyway 마이그레이션이 자동 실행됩니다.

### 4) PostgreSQL 실행

```bash
docker compose up -d
```

### 5) 서버 테스트 실행(H2)

```bash
cd apps/server
./gradlew test
```

## 기본 계정

기본 로그인 계정은 Flyway 시드(`apps/server/src/main/resources/db/migration/V3__add_auth_accounts.sql`)로 주입됩니다.

- 관리자: `admin / admin1234`
- 참가자: `user01 / user1234`

## OpenAPI 타입 생성

```bash
pnpm openapi:types
```

- 원본 스키마: `apps/server/src/main/resources/openapi/workshop-api.yaml`
- 생성 파일: `packages/types/src/generated/workshop-api.ts`

## 현재 구현 범위

- client/admin UI의 API 연동
- workshop 도메인 CRUD API
- Spring Data JPA + Flyway 기반 영속화
- 통합 테스트(H2) 기반 CRUD 검증
