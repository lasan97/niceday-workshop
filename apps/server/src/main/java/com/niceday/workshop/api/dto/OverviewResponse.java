package com.niceday.workshop.api.dto;

public record OverviewResponse(
        int activeMissions,
        int upcomingSessions,
        int totalUsers,
        int totalSchedules,
        int pendingSubmissions
) {
}
