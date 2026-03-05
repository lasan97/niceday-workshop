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
                                                new SessionPayload("team-alpha", "테스트 세션", "테스트 설명", 40))))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.workshopTeamId").value("team-alpha"))
                                .andReturn()
                                .getResponse()
                                .getContentAsString())
                .get("id")
                .asText();

        String userId = objectMapper.readTree(
                        mockMvc.perform(post("/api/v1/workshop/users")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(
                                                new UserPayload(
                                                        "test-user",
                                                        "테스트 사용자",
                                                        "표기팀",
                                                        null,
                                                        "테스트부서",
                                                        "PARTICIPANT"))))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.name").value("테스트 사용자"))
                                .andExpect(jsonPath("$.username").value("test-user"))
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
    void teamCrudAndUserPasswordResetWork() throws Exception {
        String teamId = objectMapper.readTree(
                        mockMvc.perform(post("/api/v1/workshop/teams")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(new TeamPayload("신규 워크샵팀"))))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.name").value("신규 워크샵팀"))
                                .andReturn()
                                .getResponse()
                                .getContentAsString())
                .get("id")
                .asText();

        String userId = objectMapper.readTree(
                        mockMvc.perform(post("/api/v1/workshop/users")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(
                                                new UserPayload(
                                                        "reset-target",
                                                        "초기화 대상",
                                                        "표기팀",
                                                        teamId,
                                                        "운영팀",
                                                        "PARTICIPANT"))))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.workshopTeamId").value(teamId))
                                .andReturn()
                                .getResponse()
                                .getContentAsString())
                .get("id")
                .asText();

        mockMvc.perform(post("/api/v1/workshop/users/{id}/password/reset", userId))
                .andExpect(status().isNoContent());

        mockMvc.perform(patch("/api/v1/workshop/teams/{id}", teamId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TeamPayload("워크샵팀 수정"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("워크샵팀 수정"));

        mockMvc.perform(delete("/api/v1/workshop/teams/{id}", teamId))
                .andExpect(status().isNoContent());
    }

    @Test
    void sessionReorderChangesListOrder() throws Exception {
        String firstId = objectMapper.readTree(
                        mockMvc.perform(post("/api/v1/workshop/sessions")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(
                                                new SessionPayload("team-alpha", "A 세션", "설명 A", 30))))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString())
                .get("id")
                .asText();

        String secondId = objectMapper.readTree(
                        mockMvc.perform(post("/api/v1/workshop/sessions")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(
                                                new SessionPayload("team-beta", "B 세션", "설명 B", 45))))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString())
                .get("id")
                .asText();

        com.fasterxml.jackson.databind.JsonNode sessionsNode = objectMapper.readTree(
                mockMvc.perform(get("/api/v1/workshop/sessions"))
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString()
        );
        java.util.List<String> orderedIds = new java.util.ArrayList<>();
        orderedIds.add(secondId);
        orderedIds.add(firstId);
        for (com.fasterxml.jackson.databind.JsonNode node : sessionsNode) {
            String sessionId = node.get("id").asText();
            if (!sessionId.equals(firstId) && !sessionId.equals(secondId)) {
                orderedIds.add(sessionId);
            }
        }

        mockMvc.perform(post("/api/v1/workshop/sessions/reorder")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SessionReorderPayload(orderedIds))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/workshop/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(secondId))
                .andExpect(jsonPath("$[1].id").value(firstId));
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
            String workshopTeamId,
            String title,
            String description,
            int runningMinutes
    ) {
    }

    private record TeamPayload(String name) {
    }

    private record SessionReorderPayload(java.util.List<String> orderedIds) {
    }

    private record UserPayload(
            String username,
            String name,
            String team,
            String workshopTeamId,
            String department,
            String role
    ) {
    }
}
