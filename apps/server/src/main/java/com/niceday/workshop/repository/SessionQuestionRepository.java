package com.niceday.workshop.repository;

import com.niceday.workshop.domain.SessionQuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionQuestionRepository extends JpaRepository<SessionQuestionEntity, String> {
    List<SessionQuestionEntity> findBySessionIdOrderByCreatedAtDesc(String sessionId);
}
