package com.niceday.workshop.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;

@Component
public class WorkshopAuthInterceptor implements HandlerInterceptor {

    private static final String SESSION_COOKIE_NAME = "workshop_session";
    private static final Set<String> PARTICIPANT_ALLOWED_GET_PATHS = Set.of(
            "/api/v1/workshop/overview",
            "/api/v1/workshop/schedules",
            "/api/v1/workshop/missions",
            "/api/v1/workshop/sessions"
    );

    private final AuthSessionStore sessionStore;

    public WorkshopAuthInterceptor(AuthSessionStore sessionStore) {
        this.sessionStore = sessionStore;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }

        String token = extractCookie(request, SESSION_COOKIE_NAME);
        AuthSessionStore.SessionInfo session = sessionStore.resolve(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));

        if ("ADMIN".equals(session.role())) {
            return true;
        }

        if ("PARTICIPANT".equals(session.role()) && isParticipantAllowed(request)) {
            return true;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "요청 권한이 없습니다.");
    }

    private boolean isParticipantAllowed(HttpServletRequest request) {
        return HttpMethod.GET.matches(request.getMethod())
                && PARTICIPANT_ALLOWED_GET_PATHS.contains(request.getRequestURI());
    }

    private String extractCookie(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
