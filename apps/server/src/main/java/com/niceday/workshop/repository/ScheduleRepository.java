package com.niceday.workshop.repository;

import com.niceday.workshop.domain.ScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<ScheduleEntity, String> {
}
