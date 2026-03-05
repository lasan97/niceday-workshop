package com.niceday.workshop.auth;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthSessionStore {

    private static final Duration SESSION_TTL = Duration.ofHours(8);

    private final ConcurrentHashMap<String, SessionInfo> sessions = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    public String createSession(String username, String role) {
        String token = generateToken();
        SessionInfo sessionInfo = new SessionInfo(username, role, Instant.now().plus(SESSION_TTL));
        sessions.put(token, sessionInfo);
        return token;
    }

    public Optional<SessionInfo> resolve(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        SessionInfo sessionInfo = sessions.get(token);
        if (sessionInfo == null) {
            return Optional.empty();
        }

        if (sessionInfo.expiresAt().isBefore(Instant.now())) {
            sessions.remove(token);
            return Optional.empty();
        }

        return Optional.of(sessionInfo);
    }

    public void invalidate(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        sessions.remove(token);
    }

    private String generateToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    public record SessionInfo(
            String username,
            String role,
            Instant expiresAt
    ) {
    }
}
