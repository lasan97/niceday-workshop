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

    public AuthService(AuthAccountRepository authAccountRepository) {
        this.authAccountRepository = authAccountRepository;
    }

    public AuthLoginResponse login(AuthLoginRequest request) {
        return authAccountRepository.findByUsernameAndPassword(request.username(), request.password())
                .map(account -> new AuthLoginResponse(account.getRole()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 정보가 올바르지 않습니다."));
    }
}
