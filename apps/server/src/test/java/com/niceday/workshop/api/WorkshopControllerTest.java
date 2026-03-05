package com.niceday.workshop.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class WorkshopControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void missionCrudFlowWorks() throws Exception {
        String createBody = objectMapper.writeValueAsString(new MissionPayload("테스트 미션", 77, true, 0));

        String createdId = objectMapper.readTree(
                        mockMvc.perform(post("/api/v1/workshop/missions")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(createBody))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.title").value("테스트 미션"))
                                .andReturn()
                                .getResponse()
                                .getContentAsString())
                .get("id")
                .asText();

        String patchBody = objectMapper.writeValueAsString(new MissionPayload("테스트 미션 수정", 88, false, 1));

        mockMvc.perform(patch("/api/v1/workshop/missions/{id}", createdId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patchBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("테스트 미션 수정"))
                .andExpect(jsonPath("$.active").value(false));

        mockMvc.perform(get("/api/v1/workshop/missions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + createdId + "')].title").value("테스트 미션 수정"));

        mockMvc.perform(delete("/api/v1/workshop/missions/{id}", createdId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/workshop/missions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + createdId + "')]").isEmpty());
    }

    @Test
    void scheduleSessionUserCrudAndOverviewWork() throws Exception {
        String scheduleId = objectMapper.readTree(
                        mockMvc.perform(post("/api/v1/workshop/schedules")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(
                                                new SchedulePayload("3일차", "13:00", "14:00", "테스트 일정", "테스트 룸"))))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.title").value("테스트 일정"))
                                .andReturn()
                                .getResponse()
                                .getContentAsString())
                .get("id")
                .asText();

        String sessionId = objectMapper.readTree(
                        mockMvc.perform(post("/api/v1/workshop/sessions")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(
                                                new SessionPayload("테스트팀", "테스트 세션", "테스터", "테스트 홀", true, 1))))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.team").value("테스트팀"))
                                .andReturn()
                                .getResponse()
                                .getContentAsString())
                .get("id")
                .asText();

        String userId = objectMapper.readTree(
                        mockMvc.perform(post("/api/v1/workshop/users")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(
                                                new UserPayload("테스트 사용자", "테스트팀", "테스트부서", "PARTICIPANT"))))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.name").value("테스트 사용자"))
                                .andReturn()
                                .getResponse()
                                .getContentAsString())
                .get("id")
                .asText();

        mockMvc.perform(get("/api/v1/workshop/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeMissions").value(2))
                .andExpect(jsonPath("$.upcomingSessions").value(4))
                .andExpect(jsonPath("$.totalUsers").value(5))
                .andExpect(jsonPath("$.totalSchedules").value(4))
                .andExpect(jsonPath("$.pendingSubmissions").value(3));

        mockMvc.perform(delete("/api/v1/workshop/schedules/{id}", scheduleId))
                .andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/v1/workshop/sessions/{id}", sessionId))
                .andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/v1/workshop/users/{id}", userId))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteUnknownMissionReturns404() throws Exception {
        mockMvc.perform(delete("/api/v1/workshop/missions/{id}", "mis-unknown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("미션을 찾을 수 없습니다."))
                .andExpect(jsonPath("$.fieldErrors").isMap());
    }

    @Test
    void createScheduleWithBlankTitleReturnsFieldErrors() throws Exception {
        String invalidBody = objectMapper.writeValueAsString(new SchedulePayload("1일차", "09:00", "10:00", " ", "A홀"));

        mockMvc.perform(post("/api/v1/workshop/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("입력값을 확인해주세요."))
                .andExpect(jsonPath("$.fieldErrors.title").exists());
    }

    private record MissionPayload(String title, int points, boolean active, int pendingApprovals) {
    }

    private record SchedulePayload(String day, String startsAt, String endsAt, String title, String location) {
    }

    private record SessionPayload(
            String team,
            String title,
            String speaker,
            String room,
            boolean liveQa,
            int pendingQuestions
    ) {
    }

    private record UserPayload(String name, String team, String department, String role) {
    }
}
