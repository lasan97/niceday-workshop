package com.niceday.workshop.service;

import com.niceday.workshop.api.dto.MissionResponse;
import com.niceday.workshop.api.dto.OverviewResponse;
import com.niceday.workshop.api.dto.ScheduleItemResponse;
import com.niceday.workshop.api.dto.SessionResponse;
import com.niceday.workshop.api.dto.UserResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkshopReadService {

    public OverviewResponse getOverview() {
        return new OverviewResponse(12, 8, 150, 5, 3);
    }

    public List<ScheduleItemResponse> getSchedules() {
        return List.of(
                new ScheduleItemResponse("sch-1", "1일차", "09:00", "10:30", "등록 및 환영", "그랜드 로비"),
                new ScheduleItemResponse("sch-2", "1일차", "10:30", "12:30", "키노트: 미래 비전", "메인홀 A"),
                new ScheduleItemResponse("sch-3", "2일차", "09:00", "12:00", "팀 빌딩 미션", "강릉 해변")
        );
    }

    public List<MissionResponse> getMissions() {
        return List.of(
                new MissionResponse("mis-1", "숨은 보물 찾기", 50, true, 1),
                new MissionResponse("mis-2", "팀 피라미드 사진", 30, true, 2),
                new MissionResponse("mis-3", "커피 브레이크 퀴즈", 10, false, 0)
        );
    }

    public List<SessionResponse> getSessions() {
        return List.of(
                new SessionResponse("ses-1", "알파팀", "업무 환경에서의 AI 미래", "제인 도", "그랜드홀 A", true, 5),
                new SessionResponse("ses-2", "베타팀", "지속 가능한 행사 운영", "마이클 스미스", "오션룸 2", false, 0),
                new SessionResponse("ses-3", "감마팀", "마이크로서비스 확장 전략", "사라 코너", "그랜드홀 B", true, 12)
        );
    }

    public List<UserResponse> getUsers() {
        return List.of(
                new UserResponse("usr-1", "홍길동", "알파팀", "제품팀", "PARTICIPANT"),
                new UserResponse("usr-2", "김수진", "베타팀", "마케팅팀", "PARTICIPANT"),
                new UserResponse("usr-3", "이민호", "미배정", "엔지니어링팀", "PARTICIPANT"),
                new UserResponse("usr-4", "박은지", "감마팀", "영업팀", "ADMIN")
        );
    }
}
