# workshop-server

Spring Boot 서버입니다. 환경별 DB는 Spring Profile로 분리합니다.

## 실행

```bash
gradle bootRun
```

기본 프로파일은 `local`입니다.
기본 프로파일은 `dev`입니다.

- `dev`: PostgreSQL

프로파일 지정 실행:

```bash
gradle bootRun --args='--spring.profiles.active=dev'
```

## 환경

- Java 17
- Spring Boot 3.3.x
- PostgreSQL 16 (dev)

## Read API (v1)

- `GET /api/v1/workshop/overview`
- `GET /api/v1/workshop/schedules`
- `GET /api/v1/workshop/missions`
- `GET /api/v1/workshop/sessions`
- `GET /api/v1/workshop/users`
- `POST /api/v1/auth/login`

## Write API (v1)

- `POST /api/v1/workshop/schedules`
- `PATCH /api/v1/workshop/schedules/{id}`
- `DELETE /api/v1/workshop/schedules/{id}`
- `POST /api/v1/workshop/missions`
- `PATCH /api/v1/workshop/missions/{id}`
- `DELETE /api/v1/workshop/missions/{id}`
- `POST /api/v1/workshop/sessions`
- `PATCH /api/v1/workshop/sessions/{id}`
- `DELETE /api/v1/workshop/sessions/{id}`
- `POST /api/v1/workshop/users`
- `PATCH /api/v1/workshop/users/{id}`
- `DELETE /api/v1/workshop/users/{id}`

OpenAPI 초안: `src/main/resources/openapi/workshop-api.yaml`
