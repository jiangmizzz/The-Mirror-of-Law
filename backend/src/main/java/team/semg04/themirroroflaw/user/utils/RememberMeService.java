package team.semg04.themirroroflaw.user.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Map;

public class RememberMeService extends TokenBasedRememberMeServices {

    public RememberMeService(String key, UserDetailsService userDetailsService, String cookieDomain) {
        super(key, userDetailsService);
        setAlwaysRemember(true);
        setCookieName("remember-me");
        setCookieDomain(cookieDomain);
        setUseSecureCookie(false);
    }

    public RememberMeService(String key, UserDetailsService userDetailsService,
                             RememberMeTokenAlgorithm encodingAlgorithm, String cookieDomain) {
        super(key, userDetailsService, encodingAlgorithm);
        setAlwaysRemember(true);
        setCookieName("remember-me");
        setCookieDomain(cookieDomain);
        setUseSecureCookie(false);
    }

    @Override
    public void onLoginSuccess(HttpServletRequest request, HttpServletResponse response,
                               Authentication successfulAuthentication) {
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(request.getInputStream()));
            String text = reader.lines().reduce("", (accumulator, actual) -> accumulator + actual);
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> map = objectMapper.readValue(text, Map.class);

            // If rememberMe is not set, set it to true
            boolean rememberMe = map.get("rememberMe") == null || (Boolean) map.get("rememberMe");
            if (rememberMe) {
                setTokenValiditySeconds(60 * 60 * 24 * 7);
            } else {
                setTokenValiditySeconds(-1);
            }

            super.onLoginSuccess(request, response, successfulAuthentication);
        } catch (IOException e) {
            // Handle exception
        }
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        super.logout(request, response, authentication);
        new SecurityContextLogoutHandler().logout(request, null, authentication); // logout from spring security
    }
}
