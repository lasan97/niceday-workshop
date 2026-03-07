package com.niceday.workshop.repository;

import com.niceday.workshop.domain.SchedulePeriodEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchedulePeriodRepository extends JpaRepository<SchedulePeriodEntity, String> {
}
