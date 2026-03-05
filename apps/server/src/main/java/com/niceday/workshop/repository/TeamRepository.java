package com.niceday.workshop.repository;

import com.niceday.workshop.domain.TeamEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<TeamEntity, String> {
    boolean existsByName(String name);
}
