package com.niceday.workshop.service;

import com.niceday.workshop.api.dto.MissionResponse;
import com.niceday.workshop.api.dto.MissionUpsertRequest;
import com.niceday.workshop.api.dto.OverviewResponse;
import com.niceday.workshop.api.dto.ScheduleItemResponse;
import com.niceday.workshop.api.dto.SchedulePeriodResponse;
import com.niceday.workshop.api.dto.SchedulePeriodUpdateRequest;
import com.niceday.workshop.api.dto.ScheduleUpsertRequest;
import com.niceday.workshop.api.dto.SessionQuestionAnswerRequest;
import com.niceday.workshop.api.dto.SessionQuestionCreateRequest;
import com.niceday.workshop.api.dto.SessionQuestionResponse;
import com.niceday.workshop.api.dto.SessionResponse;
import com.niceday.workshop.api.dto.SessionReorderRequest;
import com.niceday.workshop.api.dto.SessionUpsertRequest;
import com.niceday.workshop.api.dto.TeamResponse;
import com.niceday.workshop.api.dto.TeamUpsertRequest;
import com.niceday.workshop.api.dto.UserResponse;
import com.niceday.workshop.api.dto.UserUpsertRequest;
import com.niceday.workshop.domain.AuthAccountEntity;
import com.niceday.workshop.domain.MissionEntity;
import com.niceday.workshop.domain.ScheduleEntity;
import com.niceday.workshop.domain.SchedulePeriodEntity;
import com.niceday.workshop.domain.SessionEntity;
import com.niceday.workshop.domain.SessionQuestionEntity;
import com.niceday.workshop.domain.TeamEntity;
import com.niceday.workshop.domain.UserEntity;
import com.niceday.workshop.repository.AuthAccountRepository;
import com.niceday.workshop.repository.MissionRepository;
import com.niceday.workshop.repository.SchedulePeriodRepository;
import com.niceday.workshop.repository.ScheduleRepository;
import com.niceday.workshop.repository.SessionQuestionRepository;
import com.niceday.workshop.repository.SessionRepository;
import com.niceday.workshop.repository.TeamRepository;
import com.niceday.workshop.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class WorkshopService {

    private static final String DEFAULT_USER_PASSWORD = "1111";
    private static final String DEFAULT_PERIOD_ID = "default";

    private final ScheduleRepository scheduleRepository;
    private final SchedulePeriodRepository schedulePeriodRepository;
    private final MissionRepository missionRepository;
    private final SessionRepository sessionRepository;
    private final SessionQuestionRepository sessionQuestionRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final AuthAccountRepository authAccountRepository;

    public WorkshopService(
            ScheduleRepository scheduleRepository,
            SchedulePeriodRepository schedulePeriodRepository,
            MissionRepository missionRepository,
            SessionRepository sessionRepository,
            SessionQuestionRepository sessionQuestionRepository,
            UserRepository userRepository,
            TeamRepository teamRepository,
            AuthAccountRepository authAccountRepository
    ) {
        this.scheduleRepository = scheduleRepository;
        this.schedulePeriodRepository = schedulePeriodRepository;
        this.missionRepository = missionRepository;
        this.sessionRepository = sessionRepository;
        this.sessionQuestionRepository = sessionQuestionRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.authAccountRepository = authAccountRepository;
    }

    @Transactional(readOnly = true)
    public OverviewResponse getOverview() {
        List<MissionEntity> missions = missionRepository.findAll();
        int activeMissions = (int) missions.stream().filter(MissionEntity::isActive).count();
        int pending = missions.stream().mapToInt(MissionEntity::getPendingApprovals).sum();
        return new OverviewResponse(
                activeMissions,
                Math.toIntExact(sessionRepository.count()),
                Math.toIntExact(userRepository.count()),
                Math.toIntExact(scheduleRepository.count()),
                pending
        );
    }

    @Transactional(readOnly = true)
    public List<ScheduleItemResponse> getSchedules() {
        return scheduleRepository.findAll().stream()
                .sorted((a, b) -> a.getStartsAt().compareTo(b.getStartsAt()))
                .map(this::toScheduleResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SchedulePeriodResponse getSchedulePeriod() {
        SchedulePeriodEntity period = getOrCreateSchedulePeriod();
        return toSchedulePeriodResponse(period);
    }

    @Transactional
    public SchedulePeriodResponse updateSchedulePeriod(SchedulePeriodUpdateRequest request) {
        LocalDate startDate = parseDateOrThrow(request.startDate(), "startDate");
        LocalDate endDate = parseDateOrThrow(request.endDate(), "endDate");

        if (endDate.isBefore(startDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "워크샵 종료일은 시작일보다 빠를 수 없습니다.");
        }

        for (ScheduleEntity schedule : scheduleRepository.findAll()) {
            LocalDate scheduleStartDate = parseDateTimeOrThrow(schedule.getStartsAt(), "startsAt").toLocalDate();
            LocalDate scheduleEndDate = parseDateTimeOrThrow(schedule.getEndsAt(), "endsAt").toLocalDate();
            if (scheduleStartDate.isBefore(startDate) || scheduleStartDate.isAfter(endDate)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "기존 일정이 기간 범위를 벗어납니다.");
            }
            if (scheduleEndDate.isBefore(startDate) || scheduleEndDate.isAfter(endDate)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "기존 일정이 기간 범위를 벗어납니다.");
            }
        }

        SchedulePeriodEntity period = getOrCreateSchedulePeriod();
        period.setStartDate(startDate);
        period.setEndDate(endDate);
        return toSchedulePeriodResponse(schedulePeriodRepository.save(period));
    }

    @Transactional
    public ScheduleItemResponse createSchedule(ScheduleUpsertRequest request) {
        String id = nextId("sch");
        ScheduleEntity entity = new ScheduleEntity();
        entity.setId(id);
        applyScheduleRequest(entity, request);
        return toScheduleResponse(scheduleRepository.save(entity));
    }

    @Transactional
    public ScheduleItemResponse updateSchedule(String id, ScheduleUpsertRequest request) {
        ScheduleEntity entity = scheduleRepository.findById(id)
                .orElseThrow(() -> notFound("일정을 찾을 수 없습니다."));
        applyScheduleRequest(entity, request);
        return toScheduleResponse(scheduleRepository.save(entity));
    }

    @Transactional
    public void deleteSchedule(String id) {
        deleteByIdOrThrow(id, "일정을 찾을 수 없습니다.", scheduleRepository::existsById, scheduleRepository::deleteById);
    }

    @Transactional(readOnly = true)
    public List<MissionResponse> getMissions() {
        return missionRepository.findAll().stream().map(this::toMissionResponse).toList();
    }

    @Transactional
    public MissionResponse createMission(MissionUpsertRequest request) {
        String id = nextId("mis");
        MissionEntity entity = new MissionEntity();
        entity.setId(id);
        applyMissionRequest(entity, request);
        return toMissionResponse(missionRepository.save(entity));
    }

    @Transactional
    public MissionResponse updateMission(String id, MissionUpsertRequest request) {
        MissionEntity entity = missionRepository.findById(id)
                .orElseThrow(() -> notFound("미션을 찾을 수 없습니다."));
        applyMissionRequest(entity, request);
        return toMissionResponse(missionRepository.save(entity));
    }

    @Transactional
    public void deleteMission(String id) {
        deleteByIdOrThrow(id, "미션을 찾을 수 없습니다.", missionRepository::existsById, missionRepository::deleteById);
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getSessions() {
        return sessionRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                .map(this::toSessionResponse)
                .toList();
    }

    @Transactional
    public SessionResponse createSession(SessionUpsertRequest request) {
        String id = nextId("ses");
        SessionEntity entity = new SessionEntity();
        entity.setId(id);
        entity.setDisplayOrder(nextSessionDisplayOrder());
        applySessionRequest(entity, request);
        return toSessionResponse(sessionRepository.save(entity));
    }

    @Transactional
    public SessionResponse updateSession(String id, SessionUpsertRequest request) {
        SessionEntity entity = sessionRepository.findById(id)
                .orElseThrow(() -> notFound("세션을 찾을 수 없습니다."));
        applySessionRequest(entity, request);
        return toSessionResponse(sessionRepository.save(entity));
    }

    @Transactional
    public void deleteSession(String id) {
        deleteByIdOrThrow(id, "세션을 찾을 수 없습니다.", sessionRepository::existsById, sessionRepository::deleteById);
    }

    @Transactional
    public void reorderSessions(SessionReorderRequest request) {
        List<SessionEntity> sessions = sessionRepository.findAll();
        Map<String, SessionEntity> sessionById = sessions.stream()
                .collect(Collectors.toMap(SessionEntity::getId, Function.identity()));

        if (request.orderedIds().size() != sessions.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "세션 순서 정보가 올바르지 않습니다.");
        }

        for (String id : request.orderedIds()) {
            if (!sessionById.containsKey(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "세션 순서 정보가 올바르지 않습니다.");
            }
        }

        for (int index = 0; index < request.orderedIds().size(); index++) {
            SessionEntity session = sessionById.get(request.orderedIds().get(index));
            session.setDisplayOrder(index + 1);
        }
        sessionRepository.saveAll(sessions);
    }

    @Transactional(readOnly = true)
    public List<SessionQuestionResponse> getSessionQuestions(String sessionId) {
        if (!sessionRepository.existsById(sessionId)) {
            throw notFound("세션을 찾을 수 없습니다.");
        }

        return sessionQuestionRepository.findBySessionIdOrderByCreatedAtDesc(sessionId).stream()
                .map(this::toSessionQuestionResponse)
                .toList();
    }

    @Transactional
    public SessionQuestionResponse createSessionQuestion(String sessionId, SessionQuestionCreateRequest request) {
        if (!sessionRepository.existsById(sessionId)) {
            throw notFound("세션을 찾을 수 없습니다.");
        }

        SessionQuestionEntity entity = new SessionQuestionEntity();
        entity.setId(nextId("q"));
        entity.setSessionId(sessionId);
        entity.setQuestion(request.question());
        entity.setAnswer(null);
        entity.setCreatedAt(System.currentTimeMillis());
        return toSessionQuestionResponse(sessionQuestionRepository.save(entity));
    }

    @Transactional
    public SessionQuestionResponse answerSessionQuestion(String sessionId, String questionId, SessionQuestionAnswerRequest request) {
        return answerSessionQuestion(sessionId, questionId, request, null, null);
    }

    @Transactional
    public SessionQuestionResponse answerSessionQuestion(
            String sessionId,
            String questionId,
            SessionQuestionAnswerRequest request,
            String actorUsername,
            String actorRole
    ) {
        if (!sessionRepository.existsById(sessionId)) {
            throw notFound("세션을 찾을 수 없습니다.");
        }

        SessionQuestionEntity entity = sessionQuestionRepository.findById(questionId)
                .orElseThrow(() -> notFound("질문을 찾을 수 없습니다."));
        if (!sessionId.equals(entity.getSessionId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "질문과 세션 정보가 일치하지 않습니다.");
        }

        if (!"ADMIN".equals(actorRole)) {
            SessionEntity session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> notFound("세션을 찾을 수 없습니다."));
            String actorTeam = resolveUserTeamByUsername(actorUsername);
            if (!session.getTeam().equals(actorTeam)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "세션 팀 사용자만 답변할 수 있습니다.");
            }
        }

        entity.setAnswer(request.answer());
        return toSessionQuestionResponse(sessionQuestionRepository.save(entity));
    }

    @Transactional
    public void deleteSessionQuestion(String sessionId, String questionId) {
        if (!sessionRepository.existsById(sessionId)) {
            throw notFound("세션을 찾을 수 없습니다.");
        }

        SessionQuestionEntity entity = sessionQuestionRepository.findById(questionId)
                .orElseThrow(() -> notFound("질문을 찾을 수 없습니다."));
        if (!sessionId.equals(entity.getSessionId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "질문과 세션 정보가 일치하지 않습니다.");
        }

        sessionQuestionRepository.deleteById(questionId);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getTeams() {
        return teamRepository.findAll().stream().map(this::toTeamResponse).toList();
    }

    @Transactional
    public TeamResponse createTeam(TeamUpsertRequest request) {
        if (teamRepository.existsByName(request.name())) {
            throw conflict("이미 존재하는 워크샵 팀 이름입니다.");
        }

        TeamEntity entity = new TeamEntity();
        entity.setId(nextId("team"));
        entity.setName(request.name());
        return toTeamResponse(teamRepository.save(entity));
    }

    @Transactional
    public TeamResponse updateTeam(String id, TeamUpsertRequest request) {
        TeamEntity entity = teamRepository.findById(id)
                .orElseThrow(() -> notFound("워크샵 팀을 찾을 수 없습니다."));

        if (!entity.getName().equals(request.name()) && teamRepository.existsByName(request.name())) {
            throw conflict("이미 존재하는 워크샵 팀 이름입니다.");
        }

        entity.setName(request.name());
        return toTeamResponse(teamRepository.save(entity));
    }

    @Transactional
    public void deleteTeam(String id) {
        if (!teamRepository.existsById(id)) {
            throw notFound("워크샵 팀을 찾을 수 없습니다.");
        }

        userRepository.clearWorkshopTeamIdByTeamId(id);
        teamRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsers() {
        List<UserEntity> users = userRepository.findAll();
        Map<String, String> teamNames = teamRepository.findAll().stream()
                .collect(Collectors.toMap(TeamEntity::getId, TeamEntity::getName));

        List<String> userIds = users.stream().map(UserEntity::getId).toList();
        Map<String, AuthAccountEntity> authAccountsByUserId = authAccountRepository.findAllByUserIdIn(userIds).stream()
                .filter(account -> account.getUserId() != null)
                .collect(Collectors.toMap(AuthAccountEntity::getUserId, Function.identity()));

        return users.stream().map((user) -> toUserResponse(user, authAccountsByUserId, teamNames)).toList();
    }

    @Transactional
    public UserResponse createUser(UserUpsertRequest request) {
        validateWorkshopTeam(request.workshopTeamId());

        if (authAccountRepository.existsByUsername(request.username())) {
            throw conflict("이미 사용 중인 아이디입니다.");
        }

        String id = nextId("usr");
        UserEntity entity = new UserEntity();
        entity.setId(id);
        entity.setDepartment("");
        applyUserRequest(entity, request);
        UserEntity savedUser = userRepository.save(entity);

        AuthAccountEntity account = new AuthAccountEntity();
        account.setId(nextId("acc"));
        account.setUserId(savedUser.getId());
        account.setUsername(savedUser.getUsername());
        account.setPassword(DEFAULT_USER_PASSWORD);
        account.setRole(savedUser.getRole());
        authAccountRepository.save(account);

        Map<String, String> teamNames = teamRepository.findAll().stream()
                .collect(Collectors.toMap(TeamEntity::getId, TeamEntity::getName));
        Map<String, AuthAccountEntity> authByUserId = Map.of(savedUser.getId(), account);
        return toUserResponse(savedUser, authByUserId, teamNames);
    }

    @Transactional
    public UserResponse updateUser(String id, UserUpsertRequest request) {
        validateWorkshopTeam(request.workshopTeamId());

        UserEntity entity = userRepository.findById(id)
                .orElseThrow(() -> notFound("사용자를 찾을 수 없습니다."));

        AuthAccountEntity existingByUsername = authAccountRepository.findByUsername(request.username()).orElse(null);
        if (existingByUsername != null && !id.equals(existingByUsername.getUserId())) {
            throw conflict("이미 사용 중인 아이디입니다.");
        }

        applyUserRequest(entity, request);
        UserEntity savedUser = userRepository.save(entity);

        AuthAccountEntity account = authAccountRepository.findByUserId(savedUser.getId())
                .orElseGet(() -> {
                    AuthAccountEntity newAccount = new AuthAccountEntity();
                    newAccount.setId(nextId("acc"));
                    newAccount.setUserId(savedUser.getId());
                    newAccount.setPassword(DEFAULT_USER_PASSWORD);
                    return newAccount;
                });
        account.setUsername(savedUser.getUsername());
        account.setRole(savedUser.getRole());
        if (account.getPassword() == null || account.getPassword().isBlank()) {
            account.setPassword(DEFAULT_USER_PASSWORD);
        }
        authAccountRepository.save(account);

        Map<String, String> teamNames = teamRepository.findAll().stream()
                .collect(Collectors.toMap(TeamEntity::getId, TeamEntity::getName));
        Map<String, AuthAccountEntity> authByUserId = Map.of(savedUser.getId(), account);
        return toUserResponse(savedUser, authByUserId, teamNames);
    }

    @Transactional
    public void deleteUser(String id) {
        deleteByIdOrThrow(id, "사용자를 찾을 수 없습니다.", userRepository::existsById, userRepository::deleteById);
        authAccountRepository.findByUserId(id).ifPresent((account) -> authAccountRepository.deleteById(account.getId()));
    }

    @Transactional
    public void resetUserPassword(String id) {
        if (!userRepository.existsById(id)) {
            throw notFound("사용자를 찾을 수 없습니다.");
        }

        AuthAccountEntity account = authAccountRepository.findByUserId(id)
                .orElseThrow(() -> notFound("사용자 인증 계정을 찾을 수 없습니다."));
        account.setPassword(DEFAULT_USER_PASSWORD);
        authAccountRepository.save(account);
    }

    private String nextId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private void applyScheduleRequest(ScheduleEntity entity, ScheduleUpsertRequest request) {
        LocalDateTime startsAt = parseDateTimeOrThrow(request.startsAt(), "startsAt");
        LocalDateTime endsAt = parseDateTimeOrThrow(request.endsAt(), "endsAt");

        if (!startsAt.isBefore(endsAt)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "일정 종료 시각은 시작 시각보다 늦어야 합니다.");
        }

        SchedulePeriodEntity period = getOrCreateSchedulePeriod();
        if (startsAt.toLocalDate().isBefore(period.getStartDate()) || startsAt.toLocalDate().isAfter(period.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "일정 시작 날짜가 워크샵 기간을 벗어났습니다.");
        }
        if (endsAt.toLocalDate().isBefore(period.getStartDate()) || endsAt.toLocalDate().isAfter(period.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "일정 종료 날짜가 워크샵 기간을 벗어났습니다.");
        }

        entity.setStartsAt(startsAt.toString());
        entity.setEndsAt(endsAt.toString());
        entity.setTitle(request.title());
        entity.setDescription(request.description());
    }

    private void applyMissionRequest(MissionEntity entity, MissionUpsertRequest request) {
        entity.setTitle(request.title());
        entity.setPoints(request.points());
        entity.setActive(request.active());
        entity.setPendingApprovals(request.pendingApprovals());
    }

    private void applySessionRequest(SessionEntity entity, SessionUpsertRequest request) {
        entity.setTeam(request.team());
        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setRunningMinutes(request.runningMinutes());
    }

    private int nextSessionDisplayOrder() {
        return sessionRepository.findAll().stream()
                .mapToInt(SessionEntity::getDisplayOrder)
                .max()
                .orElse(0) + 1;
    }

    private void applyUserRequest(UserEntity entity, UserUpsertRequest request) {
        entity.setUsername(request.username());
        entity.setName(request.name());
        entity.setTeam(request.team());
        entity.setWorkshopTeamId(request.workshopTeamId());
        if (request.department() != null) {
            entity.setDepartment(request.department());
        }
        entity.setRole(request.role());
    }

    private void validateWorkshopTeam(String workshopTeamId) {
        if (workshopTeamId == null || workshopTeamId.isBlank()) {
            return;
        }

        if (!teamRepository.existsById(workshopTeamId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "워크샵 팀을 찾을 수 없습니다.");
        }
    }

    private ScheduleItemResponse toScheduleResponse(ScheduleEntity entity) {
        return new ScheduleItemResponse(
                entity.getId(),
                entity.getStartsAt(),
                entity.getEndsAt(),
                entity.getTitle(),
                entity.getDescription()
        );
    }

    private SchedulePeriodResponse toSchedulePeriodResponse(SchedulePeriodEntity entity) {
        return new SchedulePeriodResponse(entity.getStartDate().toString(), entity.getEndDate().toString());
    }

    private SchedulePeriodEntity getOrCreateSchedulePeriod() {
        return schedulePeriodRepository.findById(DEFAULT_PERIOD_ID)
                .orElseGet(() -> {
                    SchedulePeriodEntity period = new SchedulePeriodEntity();
                    period.setId(DEFAULT_PERIOD_ID);
                    period.setStartDate(LocalDate.now());
                    period.setEndDate(LocalDate.now().plusDays(1));
                    return schedulePeriodRepository.save(period);
                });
    }

    private LocalDateTime parseDateTimeOrThrow(String value, String fieldName) {
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " 값이 올바른 날짜시간 형식이 아닙니다.");
        }
    }

    private LocalDate parseDateOrThrow(String value, String fieldName) {
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " 값이 올바른 날짜 형식이 아닙니다.");
        }
    }

    private MissionResponse toMissionResponse(MissionEntity entity) {
        return new MissionResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getPoints(),
                entity.isActive(),
                entity.getPendingApprovals()
        );
    }

    private SessionResponse toSessionResponse(SessionEntity entity) {
        return new SessionResponse(
                entity.getId(),
                entity.getTeam() == null || entity.getTeam().isBlank() ? "미배정" : entity.getTeam(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getRunningMinutes(),
                entity.getDisplayOrder()
        );
    }

    private SessionQuestionResponse toSessionQuestionResponse(SessionQuestionEntity entity) {
        return new SessionQuestionResponse(
                entity.getId(),
                entity.getSessionId(),
                entity.getQuestion(),
                entity.getAnswer(),
                entity.getCreatedAt()
        );
    }

    private TeamResponse toTeamResponse(TeamEntity entity) {
        return new TeamResponse(entity.getId(), entity.getName());
    }

    private UserResponse toUserResponse(
            UserEntity entity,
            Map<String, AuthAccountEntity> authAccountsByUserId,
            Map<String, String> teamNames
    ) {
        AuthAccountEntity authAccount = authAccountsByUserId.get(entity.getId());
        String workshopTeamId = entity.getWorkshopTeamId();

        return new UserResponse(
                entity.getId(),
                authAccount != null ? authAccount.getUsername() : entity.getUsername(),
                entity.getName(),
                entity.getTeam(),
                workshopTeamId,
                workshopTeamId == null ? null : teamNames.get(workshopTeamId),
                entity.getDepartment(),
                entity.getRole()
        );
    }

    private String resolveUserTeamByUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        AuthAccountEntity account = authAccountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 계정을 찾을 수 없습니다."));
        UserEntity user = userRepository.findById(account.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자 정보를 찾을 수 없습니다."));
        return user.getTeam();
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private void deleteByIdOrThrow(
            String id,
            String message,
            java.util.function.Predicate<String> existsChecker,
            java.util.function.Consumer<String> deleteAction
    ) {
        if (!existsChecker.test(id)) {
            throw notFound(message);
        }
        deleteAction.accept(id);
    }
}
