package com.niceday.workshop.repository;

import com.niceday.workshop.domain.MissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MissionRepository extends JpaRepository<MissionEntity, String> {
}
