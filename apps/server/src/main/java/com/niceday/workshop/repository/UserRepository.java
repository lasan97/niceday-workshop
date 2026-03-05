package com.niceday.workshop.repository;

import com.niceday.workshop.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findByUsername(String username);

    @Modifying
    @Query("update UserEntity u set u.workshopTeamId = null where u.workshopTeamId = :teamId")
    void clearWorkshopTeamIdByTeamId(@Param("teamId") String teamId);
}
