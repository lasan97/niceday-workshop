package com.niceday.workshop.repository;

import com.niceday.workshop.domain.AuthAccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AuthAccountRepository extends JpaRepository<AuthAccountEntity, String> {
    Optional<AuthAccountEntity> findByUsernameAndPassword(String username, String password);
    Optional<AuthAccountEntity> findByUsername(String username);
    Optional<AuthAccountEntity> findByUserId(String userId);
    List<AuthAccountEntity> findAllByUserIdIn(Collection<String> userIds);
    boolean existsByUsername(String username);
}
