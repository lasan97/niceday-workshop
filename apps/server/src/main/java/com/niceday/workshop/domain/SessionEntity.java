package com.niceday.workshop.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "workshop_session")
public class SessionEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "workshop_team_id", length = 64)
    private String workshopTeamId;

    @Column(length = 120, nullable = false)
    private String title;

    @Column(length = 400, nullable = false)
    private String description;

    @Column(name = "running_minutes", nullable = false)
    private int runningMinutes;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getWorkshopTeamId() {
        return workshopTeamId;
    }

    public void setWorkshopTeamId(String workshopTeamId) {
        this.workshopTeamId = workshopTeamId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getRunningMinutes() {
        return runningMinutes;
    }

    public void setRunningMinutes(int runningMinutes) {
        this.runningMinutes = runningMinutes;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }
}
