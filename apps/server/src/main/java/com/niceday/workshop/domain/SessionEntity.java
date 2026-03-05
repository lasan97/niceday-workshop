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

    @Column(length = 64, nullable = false)
    private String team;

    @Column(length = 120, nullable = false)
    private String title;

    @Column(length = 64, nullable = false)
    private String speaker;

    @Column(length = 64, nullable = false)
    private String room;

    @Column(name = "live_qa", nullable = false)
    private boolean liveQa;

    @Column(name = "pending_questions", nullable = false)
    private int pendingQuestions;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSpeaker() {
        return speaker;
    }

    public void setSpeaker(String speaker) {
        this.speaker = speaker;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public boolean isLiveQa() {
        return liveQa;
    }

    public void setLiveQa(boolean liveQa) {
        this.liveQa = liveQa;
    }

    public int getPendingQuestions() {
        return pendingQuestions;
    }

    public void setPendingQuestions(int pendingQuestions) {
        this.pendingQuestions = pendingQuestions;
    }
}
