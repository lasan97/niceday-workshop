# workshop-server

Spring Boot 서버입니다. 환경별 DB는 Spring Profile로 분리합니다.

## 실행

```bash
gradle bootRun
```

기본 프로파일은 `local`입니다.

- `local`: H2 인메모리 DB
- `dev`: PostgreSQL

프로파일 지정 실행:

```bash
gradle bootRun --args='--spring.profiles.active=local'
gradle bootRun --args='--spring.profiles.active=dev'
```

## 환경

- Java 17
- Spring Boot 3.3.x
- H2 (local)
- PostgreSQL 16 (dev)

## Read API (v1)

- `GET /api/v1/workshop/overview`
- `GET /api/v1/workshop/schedules`
- `GET /api/v1/workshop/missions`
- `GET /api/v1/workshop/sessions`
- `GET /api/v1/workshop/users`

OpenAPI 초안: `src/main/resources/openapi/workshop-api.yaml`
