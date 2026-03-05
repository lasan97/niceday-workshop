package com.niceday.workshop.repository;

import com.niceday.workshop.domain.SessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<SessionEntity, String> {
}
