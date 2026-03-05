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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class WorkshopService {

    private final Map<String, ScheduleItemResponse> schedules = new LinkedHashMap<>();
    private final Map<String, MissionResponse> missions = new LinkedHashMap<>();
    private final Map<String, SessionResponse> sessions = new LinkedHashMap<>();
    private final Map<String, UserResponse> users = new LinkedHashMap<>();

    public WorkshopService() {
        schedules.put("sch-1", new ScheduleItemResponse("sch-1", "1일차", "09:00", "10:30", "등록 및 환영", "그랜드 로비"));
        schedules.put("sch-2", new ScheduleItemResponse("sch-2", "1일차", "10:30", "12:30", "키노트: 미래 비전", "메인홀 A"));
        schedules.put("sch-3", new ScheduleItemResponse("sch-3", "2일차", "09:00", "12:00", "팀 빌딩 미션", "강릉 해변"));

        missions.put("mis-1", new MissionResponse("mis-1", "숨은 보물 찾기", 50, true, 1));
        missions.put("mis-2", new MissionResponse("mis-2", "팀 피라미드 사진", 30, true, 2));
        missions.put("mis-3", new MissionResponse("mis-3", "커피 브레이크 퀴즈", 10, false, 0));

        sessions.put("ses-1", new SessionResponse("ses-1", "알파팀", "업무 환경에서의 AI 미래", "제인 도", "그랜드홀 A", true, 5));
        sessions.put("ses-2", new SessionResponse("ses-2", "베타팀", "지속 가능한 행사 운영", "마이클 스미스", "오션룸 2", false, 0));
        sessions.put("ses-3", new SessionResponse("ses-3", "감마팀", "마이크로서비스 확장 전략", "사라 코너", "그랜드홀 B", true, 12));

        users.put("usr-1", new UserResponse("usr-1", "홍길동", "알파팀", "제품팀", "PARTICIPANT"));
        users.put("usr-2", new UserResponse("usr-2", "김수진", "베타팀", "마케팅팀", "PARTICIPANT"));
        users.put("usr-3", new UserResponse("usr-3", "이민호", "미배정", "엔지니어링팀", "PARTICIPANT"));
        users.put("usr-4", new UserResponse("usr-4", "박은지", "감마팀", "영업팀", "ADMIN"));
    }

    public OverviewResponse getOverview() {
        int pending = missions.values().stream().mapToInt(MissionResponse::pendingApprovals).sum();
        return new OverviewResponse(missions.size(), sessions.size(), users.size(), schedules.size(), pending);
    }

    public List<ScheduleItemResponse> getSchedules() {
        return new ArrayList<>(schedules.values());
    }

    public ScheduleItemResponse createSchedule(ScheduleUpsertRequest request) {
        String id = nextId("sch");
        ScheduleItemResponse created = new ScheduleItemResponse(id, request.day(), request.startsAt(), request.endsAt(), request.title(), request.location());
        schedules.put(id, created);
        return created;
    }

    public ScheduleItemResponse updateSchedule(String id, ScheduleUpsertRequest request) {
        assertExists(schedules, id, "일정을 찾을 수 없습니다.");
        ScheduleItemResponse updated = new ScheduleItemResponse(id, request.day(), request.startsAt(), request.endsAt(), request.title(), request.location());
        schedules.put(id, updated);
        return updated;
    }

    public void deleteSchedule(String id) {
        removeOrThrow(schedules, id, "일정을 찾을 수 없습니다.");
    }

    public List<MissionResponse> getMissions() {
        return new ArrayList<>(missions.values());
    }

    public MissionResponse createMission(MissionUpsertRequest request) {
        String id = nextId("mis");
        MissionResponse created = new MissionResponse(id, request.title(), request.points(), request.active(), request.pendingApprovals());
        missions.put(id, created);
        return created;
    }

    public MissionResponse updateMission(String id, MissionUpsertRequest request) {
        assertExists(missions, id, "미션을 찾을 수 없습니다.");
        MissionResponse updated = new MissionResponse(id, request.title(), request.points(), request.active(), request.pendingApprovals());
        missions.put(id, updated);
        return updated;
    }

    public void deleteMission(String id) {
        removeOrThrow(missions, id, "미션을 찾을 수 없습니다.");
    }

    public List<SessionResponse> getSessions() {
        return new ArrayList<>(sessions.values());
    }

    public SessionResponse createSession(SessionUpsertRequest request) {
        String id = nextId("ses");
        SessionResponse created = new SessionResponse(id, request.team(), request.title(), request.speaker(), request.room(), request.liveQa(), request.pendingQuestions());
        sessions.put(id, created);
        return created;
    }

    public SessionResponse updateSession(String id, SessionUpsertRequest request) {
        assertExists(sessions, id, "세션을 찾을 수 없습니다.");
        SessionResponse updated = new SessionResponse(id, request.team(), request.title(), request.speaker(), request.room(), request.liveQa(), request.pendingQuestions());
        sessions.put(id, updated);
        return updated;
    }

    public void deleteSession(String id) {
        removeOrThrow(sessions, id, "세션을 찾을 수 없습니다.");
    }

    public List<UserResponse> getUsers() {
        return new ArrayList<>(users.values());
    }

    public UserResponse createUser(UserUpsertRequest request) {
        String id = nextId("usr");
        UserResponse created = new UserResponse(id, request.name(), request.team(), request.department(), request.role());
        users.put(id, created);
        return created;
    }

    public UserResponse updateUser(String id, UserUpsertRequest request) {
        assertExists(users, id, "사용자를 찾을 수 없습니다.");
        UserResponse updated = new UserResponse(id, request.name(), request.team(), request.department(), request.role());
        users.put(id, updated);
        return updated;
    }

    public void deleteUser(String id) {
        removeOrThrow(users, id, "사용자를 찾을 수 없습니다.");
    }

    private String nextId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private <T> void assertExists(Map<String, T> store, String id, String message) {
        if (!store.containsKey(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, message);
        }
    }

    private <T> void removeOrThrow(Map<String, T> store, String id, String message) {
        T removed = store.remove(id);
        if (removed == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, message);
        }
    }
}
