package com.niceday.workshop.api.dto;

import jakarta.validation.constraints.NotBlank;

public record SessionQuestionCreateRequest(
        @NotBlank String question
) {
}
