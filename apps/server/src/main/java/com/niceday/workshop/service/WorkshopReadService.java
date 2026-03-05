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
                new ScheduleItemResponse("sch-1", "DAY_1", "09:00", "10:30", "Registration & Welcome", "Grand Lobby"),
                new ScheduleItemResponse("sch-2", "DAY_1", "10:30", "12:30", "Keynote: Future Vision", "Main Hall A"),
                new ScheduleItemResponse("sch-3", "DAY_2", "09:00", "12:00", "Team Building Mission", "Gangneung Beach")
        );
    }

    public List<MissionResponse> getMissions() {
        return List.of(
                new MissionResponse("mis-1", "Find the Hidden Treasure", 50, true, 1),
                new MissionResponse("mis-2", "Group Pyramid Photo", 30, true, 2),
                new MissionResponse("mis-3", "Coffee Break Trivia", 10, false, 0)
        );
    }

    public List<SessionResponse> getSessions() {
        return List.of(
                new SessionResponse("ses-1", "TEAM ALPHA", "The Future of AI in the Workplace", "Jane Doe", "Grand Hall A", true, 5),
                new SessionResponse("ses-2", "TEAM BETA", "Sustainable Event Management", "Michael Smith", "Ocean Room 2", false, 0),
                new SessionResponse("ses-3", "TEAM GAMMA", "Scaling Up Microservices", "Sarah Connor", "Grand Hall B", true, 12)
        );
    }

    public List<UserResponse> getUsers() {
        return List.of(
                new UserResponse("usr-1", "John Doe", "Team Alpha", "Product", "PARTICIPANT"),
                new UserResponse("usr-2", "Sarah Jenkins", "Team Beta", "Marketing", "PARTICIPANT"),
                new UserResponse("usr-3", "Michael Kim", "Unassigned", "Engineering", "PARTICIPANT"),
                new UserResponse("usr-4", "Emily Park", "Team Gamma", "Sales", "ADMIN")
        );
    }
}
