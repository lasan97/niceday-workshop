package com.niceday.workshop.auth;

import com.niceday.workshop.auth.dto.AuthLoginRequest;
import com.niceday.workshop.auth.dto.AuthLoginResponse;
import com.niceday.workshop.auth.dto.AuthMeResponse;
import com.niceday.workshop.repository.UserRepository;
import com.niceday.workshop.repository.AuthAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final AuthAccountRepository authAccountRepository;
    private final AuthSessionStore authSessionStore;
    private final UserRepository userRepository;

    public AuthService(
            AuthAccountRepository authAccountRepository,
            AuthSessionStore authSessionStore,
            UserRepository userRepository
    ) {
        this.authAccountRepository = authAccountRepository;
        this.authSessionStore = authSessionStore;
        this.userRepository = userRepository;
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

    public AuthMeResponse me(String sessionToken) {
        AuthSessionStore.SessionInfo session = authSessionStore.resolve(sessionToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));

        String team = userRepository.findByUsername(session.username())
                .map((user) -> user.getTeam())
                .orElse("미배정");

        return new AuthMeResponse(session.username(), session.role(), team);
    }
}
