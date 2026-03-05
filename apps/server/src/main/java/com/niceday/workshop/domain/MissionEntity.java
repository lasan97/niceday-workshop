package com.niceday.workshop.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "workshop_mission")
public class MissionEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(length = 120, nullable = false)
    private String title;

    @Column(nullable = false)
    private int points;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "pending_approvals", nullable = false)
    private int pendingApprovals;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public int getPendingApprovals() {
        return pendingApprovals;
    }

    public void setPendingApprovals(int pendingApprovals) {
        this.pendingApprovals = pendingApprovals;
    }
}
