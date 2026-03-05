package com.niceday.workshop.service;

import com.niceday.workshop.api.dto.MissionResponse;
import com.niceday.workshop.api.dto.MissionUpsertRequest;
import com.niceday.workshop.api.dto.OverviewResponse;
import com.niceday.workshop.api.dto.ScheduleItemResponse;
import com.niceday.workshop.api.dto.ScheduleUpsertRequest;
import com.niceday.workshop.api.dto.SessionResponse;
import com.niceday.workshop.api.dto.SessionUpsertRequest;
import com.niceday.workshop.api.dto.UserResponse;
import com.niceday.workshop.api.dto.UserUpsertRequest;
import com.niceday.workshop.domain.MissionEntity;
import com.niceday.workshop.domain.ScheduleEntity;
import com.niceday.workshop.domain.SessionEntity;
import com.niceday.workshop.domain.UserEntity;
import com.niceday.workshop.repository.MissionRepository;
import com.niceday.workshop.repository.ScheduleRepository;
import com.niceday.workshop.repository.SessionRepository;
import com.niceday.workshop.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class WorkshopService {

    private final ScheduleRepository scheduleRepository;
    private final MissionRepository missionRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public WorkshopService(
            ScheduleRepository scheduleRepository,
            MissionRepository missionRepository,
            SessionRepository sessionRepository,
            UserRepository userRepository
    ) {
        this.scheduleRepository = scheduleRepository;
        this.missionRepository = missionRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
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
    public List<UserResponse> getUsers() {
        return userRepository.findAll().stream().map(this::toUserResponse).toList();
    }

    @Transactional
    public UserResponse createUser(UserUpsertRequest request) {
        String id = nextId("usr");
        UserEntity entity = new UserEntity();
        entity.setId(id);
        applyUserRequest(entity, request);
        return toUserResponse(userRepository.save(entity));
    }

    @Transactional
    public UserResponse updateUser(String id, UserUpsertRequest request) {
        UserEntity entity = userRepository.findById(id)
                .orElseThrow(() -> notFound("사용자를 찾을 수 없습니다."));
        applyUserRequest(entity, request);
        return toUserResponse(userRepository.save(entity));
    }

    @Transactional
    public void deleteUser(String id) {
        deleteByIdOrThrow(id, "사용자를 찾을 수 없습니다.", userRepository::existsById, userRepository::deleteById);
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
        entity.setName(request.name());
        entity.setTeam(request.team());
        entity.setDepartment(request.department());
        entity.setRole(request.role());
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

    private UserResponse toUserResponse(UserEntity entity) {
        return new UserResponse(
                entity.getId(),
                entity.getName(),
                entity.getTeam(),
                entity.getDepartment(),
                entity.getRole()
        );
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
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
