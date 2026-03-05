package com.niceday.workshop.repository;

import com.niceday.workshop.domain.AuthAccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthAccountRepository extends JpaRepository<AuthAccountEntity, String> {
    Optional<AuthAccountEntity> findByUsernameAndPassword(String username, String password);
}
