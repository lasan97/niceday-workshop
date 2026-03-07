package com.niceday.workshop.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "workshop_schedule")
public class ScheduleEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "starts_at", length = 32, nullable = false)
    private String startsAt;

    @Column(name = "ends_at", length = 32, nullable = false)
    private String endsAt;

    @Column(length = 120, nullable = false)
    private String title;

    @Column(length = 400, nullable = false)
    private String description;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(String startsAt) {
        this.startsAt = startsAt;
    }

    public String getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(String endsAt) {
        this.endsAt = endsAt;
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
}
