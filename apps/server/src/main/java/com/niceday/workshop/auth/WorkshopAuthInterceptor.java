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
    public static final String AUTH_USERNAME_ATTR = "workshopAuthUsername";
    public static final String AUTH_ROLE_ATTR = "workshopAuthRole";
    private static final Set<String> PARTICIPANT_ALLOWED_GET_PATHS = Set.of(
            "/api/v1/workshop/overview",
            "/api/v1/workshop/schedules",
            "/api/v1/workshop/schedule-period",
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
        request.setAttribute(AUTH_USERNAME_ATTR, session.username());
        request.setAttribute(AUTH_ROLE_ATTR, session.role());

        if ("ADMIN".equals(session.role())) {
            return true;
        }

        if ("PARTICIPANT".equals(session.role()) && isParticipantAllowed(request)) {
            return true;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "요청 권한이 없습니다.");
    }

    private boolean isParticipantAllowed(HttpServletRequest request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        if (HttpMethod.GET.matches(method) && PARTICIPANT_ALLOWED_GET_PATHS.contains(uri)) {
            return true;
        }

        // 세션 Q&A는 참가자도 조회/질문등록/답변등록 가능
        if (uri.matches("^/api/v1/workshop/sessions/[^/]+/questions$")) {
            return HttpMethod.GET.matches(method) || HttpMethod.POST.matches(method);
        }

        if (uri.matches("^/api/v1/workshop/sessions/[^/]+/questions/[^/]+/answer$")) {
            return HttpMethod.PATCH.matches(method);
        }

        return false;
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
