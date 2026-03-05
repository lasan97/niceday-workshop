package com.niceday.workshop.service;

import com.niceday.workshop.api.dto.MissionResponse;
import com.niceday.workshop.api.dto.MissionUpsertRequest;
import com.niceday.workshop.api.dto.OverviewResponse;
import com.niceday.workshop.api.dto.ScheduleItemResponse;
import com.niceday.workshop.api.dto.ScheduleUpsertRequest;
import com.niceday.workshop.api.dto.SessionResponse;
import com.niceday.workshop.api.dto.SessionUpsertRequest;
import com.niceday.workshop.api.dto.TeamResponse;
import com.niceday.workshop.api.dto.TeamUpsertRequest;
import com.niceday.workshop.api.dto.UserResponse;
import com.niceday.workshop.api.dto.UserUpsertRequest;
import com.niceday.workshop.domain.AuthAccountEntity;
import com.niceday.workshop.domain.MissionEntity;
import com.niceday.workshop.domain.ScheduleEntity;
import com.niceday.workshop.domain.SessionEntity;
import com.niceday.workshop.domain.TeamEntity;
import com.niceday.workshop.domain.UserEntity;
import com.niceday.workshop.repository.AuthAccountRepository;
import com.niceday.workshop.repository.MissionRepository;
import com.niceday.workshop.repository.ScheduleRepository;
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
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class WorkshopService {

    private static final String DEFAULT_USER_PASSWORD = "1111";

    private final ScheduleRepository scheduleRepository;
    private final MissionRepository missionRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final AuthAccountRepository authAccountRepository;

    public WorkshopService(
            ScheduleRepository scheduleRepository,
            MissionRepository missionRepository,
            SessionRepository sessionRepository,
            UserRepository userRepository,
            TeamRepository teamRepository,
            AuthAccountRepository authAccountRepository
    ) {
        this.scheduleRepository = scheduleRepository;
        this.missionRepository = missionRepository;
        this.sessionRepository = sessionRepository;
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
        return scheduleRepository.findAll().stream().map(this::toScheduleResponse).toList();
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
        return sessionRepository.findAll().stream().map(this::toSessionResponse).toList();
    }

    @Transactional
    public SessionResponse createSession(SessionUpsertRequest request) {
        String id = nextId("ses");
        SessionEntity entity = new SessionEntity();
        entity.setId(id);
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
        entity.setDay(request.day());
        entity.setStartsAt(request.startsAt());
        entity.setEndsAt(request.endsAt());
        entity.setTitle(request.title());
        entity.setLocation(request.location());
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
        entity.setSpeaker(request.speaker());
        entity.setRoom(request.room());
        entity.setLiveQa(request.liveQa());
        entity.setPendingQuestions(request.pendingQuestions());
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
                entity.getDay(),
                entity.getStartsAt(),
                entity.getEndsAt(),
                entity.getTitle(),
                entity.getLocation()
        );
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
                entity.getTeam(),
                entity.getTitle(),
                entity.getSpeaker(),
                entity.getRoom(),
                entity.isLiveQa(),
                entity.getPendingQuestions()
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
