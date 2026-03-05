package com.niceday.workshop.api.dto;

import jakarta.validation.constraints.NotBlank;

public record SessionQuestionAnswerRequest(
        @NotBlank String answer
) {
}
