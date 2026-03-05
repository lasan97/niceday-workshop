package com.niceday.workshop.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
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

    private record MissionPayload(String title, int points, boolean active, int pendingApprovals) {
    }
}
