package com.niceday.workshop.api;

import com.niceday.workshop.api.dto.MissionResponse;
import com.niceday.workshop.api.dto.OverviewResponse;
import com.niceday.workshop.api.dto.ScheduleItemResponse;
import com.niceday.workshop.api.dto.SessionResponse;
import com.niceday.workshop.api.dto.UserResponse;
import com.niceday.workshop.service.WorkshopReadService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workshop")
public class WorkshopReadController {

    private final WorkshopReadService workshopReadService;

    public WorkshopReadController(WorkshopReadService workshopReadService) {
        this.workshopReadService = workshopReadService;
    }

    @GetMapping("/overview")
    public OverviewResponse getOverview() {
        return workshopReadService.getOverview();
    }

    @GetMapping("/schedules")
    public List<ScheduleItemResponse> getSchedules() {
        return workshopReadService.getSchedules();
    }

    @GetMapping("/missions")
    public List<MissionResponse> getMissions() {
        return workshopReadService.getMissions();
    }

    @GetMapping("/sessions")
    public List<SessionResponse> getSessions() {
        return workshopReadService.getSessions();
    }

    @GetMapping("/users")
    public List<UserResponse> getUsers() {
        return workshopReadService.getUsers();
    }
}
