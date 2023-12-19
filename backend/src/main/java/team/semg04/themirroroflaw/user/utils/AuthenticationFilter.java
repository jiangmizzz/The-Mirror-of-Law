package team.semg04.themirroroflaw.user.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import team.semg04.themirroroflaw.user.entity.User;
import team.semg04.themirroroflaw.user.service.UserService;

import java.io.IOException;
import java.util.Map;

public class AuthenticationFilter extends AbstractAuthenticationProcessingFilter {
    private static final AntPathRequestMatcher DEFAULT_ANT_PATH_REQUEST_MATCHER =
            new AntPathRequestMatcher("/api/user/login", "POST");
    private final boolean postOnly = true;
    private final UserService userService;

    public AuthenticationFilter(UserService userService) {
        super(DEFAULT_ANT_PATH_REQUEST_MATCHER);
        this.userService = userService;
    }

    public AuthenticationFilter(UserService userService, AuthenticationManager authenticationManager) {
        super(DEFAULT_ANT_PATH_REQUEST_MATCHER, authenticationManager);
        this.userService = userService;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {
        if (postOnly && !request.getMethod().equals("POST")) {
            throw new AuthenticationServiceException("Authentication method not supported: " + request.getMethod());
        }

        try {
            String text = request.getReader().lines().reduce("", (s, s2) -> s + s2);
            ObjectMapper objectMapper = new ObjectMapper();
            Map<?, ?> map = objectMapper.readValue(text, Map.class);

            if (map.get("email") == null) {
                throw new BadCredentialsException("Email is null");
            } else if (map.get("password") == null) {
                throw new BadCredentialsException("Password is null");
            }

            String username = (String) map.get("email");
            Object password = map.get("password");
            User user = userService.getByEmail(username);

            if (user == null) {
                throw new BadCredentialsException("User not found");
            }

            UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(user.getId(),
                    password);

            // Allow subclasses to set the "details" property
            setDetails(request, authRequest);
            return getAuthenticationManager().authenticate(authRequest);
        } catch (IOException e) {
            throw new AuthenticationServiceException("Error reading authentication details from request", e);
        }
    }

    /**
     * Provided so that subclasses may configure what is put into the authentication
     * request's details property.
     *
     * @param request     that an authentication request is being created for
     * @param authRequest the authentication request object that should have its details set
     */
    private void setDetails(HttpServletRequest request, UsernamePasswordAuthenticationToken authRequest) {
        authRequest.setDetails(authenticationDetailsSource.buildDetails(request));
    }
}
