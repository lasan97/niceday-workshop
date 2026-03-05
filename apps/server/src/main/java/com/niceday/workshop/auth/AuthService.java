package com.niceday.workshop.auth;

import com.niceday.workshop.auth.dto.AuthLoginRequest;
import com.niceday.workshop.auth.dto.AuthLoginResponse;
import com.niceday.workshop.repository.AuthAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final AuthAccountRepository authAccountRepository;
    private final AuthSessionStore authSessionStore;

    public AuthService(AuthAccountRepository authAccountRepository, AuthSessionStore authSessionStore) {
        this.authAccountRepository = authAccountRepository;
        this.authSessionStore = authSessionStore;
    }

    public AuthLoginResponse login(AuthLoginRequest request) {
        return authAccountRepository.findByUsernameAndPassword(request.username(), request.password())
                .map(account -> new AuthLoginResponse(
                        account.getRole(),
                        authSessionStore.createSession(account.getUsername(), account.getRole())
                ))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 정보가 올바르지 않습니다."));
    }

    public void logout(String sessionToken) {
        authSessionStore.invalidate(sessionToken);
    }
}
