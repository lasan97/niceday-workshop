package com.niceday.workshop.api;

import com.niceday.workshop.api.dto.MissionResponse;
import com.niceday.workshop.api.dto.MissionUpsertRequest;
import com.niceday.workshop.api.dto.OverviewResponse;
import com.niceday.workshop.api.dto.ScheduleItemResponse;
import com.niceday.workshop.api.dto.ScheduleUpsertRequest;
import com.niceday.workshop.api.dto.SessionResponse;
import com.niceday.workshop.api.dto.SessionUpsertRequest;
import com.niceday.workshop.api.dto.UserResponse;
import com.niceday.workshop.api.dto.UserUpsertRequest;
import com.niceday.workshop.service.WorkshopService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workshop")
public class WorkshopController {

    private final WorkshopService workshopService;

    public WorkshopController(WorkshopService workshopService) {
        this.workshopService = workshopService;
    }

    @GetMapping("/overview")
    public OverviewResponse getOverview() {
        return workshopService.getOverview();
    }

    @GetMapping("/schedules")
    public List<ScheduleItemResponse> getSchedules() {
        return workshopService.getSchedules();
    }

    @PostMapping("/schedules")
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleItemResponse createSchedule(@Valid @RequestBody ScheduleUpsertRequest request) {
        return workshopService.createSchedule(request);
    }

    @PatchMapping("/schedules/{id}")
    public ScheduleItemResponse updateSchedule(@PathVariable String id, @Valid @RequestBody ScheduleUpsertRequest request) {
        return workshopService.updateSchedule(id, request);
    }

    @DeleteMapping("/schedules/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSchedule(@PathVariable String id) {
        workshopService.deleteSchedule(id);
    }

    @GetMapping("/missions")
    public List<MissionResponse> getMissions() {
        return workshopService.getMissions();
    }

    @PostMapping("/missions")
    @ResponseStatus(HttpStatus.CREATED)
    public MissionResponse createMission(@Valid @RequestBody MissionUpsertRequest request) {
        return workshopService.createMission(request);
    }

    @PatchMapping("/missions/{id}")
    public MissionResponse updateMission(@PathVariable String id, @Valid @RequestBody MissionUpsertRequest request) {
        return workshopService.updateMission(id, request);
    }

    @DeleteMapping("/missions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMission(@PathVariable String id) {
        workshopService.deleteMission(id);
    }

    @GetMapping("/sessions")
    public List<SessionResponse> getSessions() {
        return workshopService.getSessions();
    }

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public SessionResponse createSession(@Valid @RequestBody SessionUpsertRequest request) {
        return workshopService.createSession(request);
    }

    @PatchMapping("/sessions/{id}")
    public SessionResponse updateSession(@PathVariable String id, @Valid @RequestBody SessionUpsertRequest request) {
        return workshopService.updateSession(id, request);
    }

    @DeleteMapping("/sessions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSession(@PathVariable String id) {
        workshopService.deleteSession(id);
    }

    @GetMapping("/users")
    public List<UserResponse> getUsers() {
        return workshopService.getUsers();
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody UserUpsertRequest request) {
        return workshopService.createUser(request);
    }

    @PatchMapping("/users/{id}")
    public UserResponse updateUser(@PathVariable String id, @Valid @RequestBody UserUpsertRequest request) {
        return workshopService.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String id) {
        workshopService.deleteUser(id);
    }
}
