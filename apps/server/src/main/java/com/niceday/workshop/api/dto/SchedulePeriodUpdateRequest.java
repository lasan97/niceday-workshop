package com.niceday.workshop.api.dto;

import jakarta.validation.constraints.NotBlank;

public record SchedulePeriodUpdateRequest(
        @NotBlank String startDate,
        @NotBlank String endDate
) {
}
