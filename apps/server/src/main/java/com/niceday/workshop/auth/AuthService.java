package com.niceday.workshop.auth;

import com.niceday.workshop.auth.dto.AuthLoginRequest;
import com.niceday.workshop.auth.dto.AuthLoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final AuthProperties authProperties;

    public AuthService(AuthProperties authProperties) {
        this.authProperties = authProperties;
    }

    public AuthLoginResponse login(AuthLoginRequest request) {
        return authProperties.getAccounts().stream()
                .filter(account -> account.getUsername().equals(request.username()))
                .filter(account -> account.getPassword().equals(request.password()))
                .findFirst()
                .map(account -> new AuthLoginResponse(account.getRole()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 정보가 올바르지 않습니다."));
    }
}
