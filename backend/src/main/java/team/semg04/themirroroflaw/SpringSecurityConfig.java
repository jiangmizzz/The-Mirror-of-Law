package team.semg04.themirroroflaw;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.RememberMeAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.rememberme.RememberMeAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.stereotype.Service;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import team.semg04.themirroroflaw.user.UserController;
import team.semg04.themirroroflaw.user.service.UserService;
import team.semg04.themirroroflaw.user.utils.AuthenticationFilter;
import team.semg04.themirroroflaw.user.utils.HttpRequestFilter;
import team.semg04.themirroroflaw.user.utils.LoginAuthenticationProvider;
import team.semg04.themirroroflaw.user.utils.RememberMeService;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.springframework.security.core.authority.AuthorityUtils.createAuthorityList;

@Configuration
@EnableWebSecurity
public class SpringSecurityConfig {

    private final UserService userService;
    @Value("${rememberMe.key}")
    private String key;
    @Value("${rememberMe.cookieDomain}")
    private String cookieDomain;

    @Autowired
    public SpringSecurityConfig(UserService userService) {
        this.userService = userService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        AuthenticationFilter authenticationFilter = new AuthenticationFilter(userService, authenticationManager());
        authenticationFilter.setRememberMeServices(rememberMeServices());
        authenticationFilter.setAuthenticationSuccessHandler(new SuccessHandler(userService));
        authenticationFilter.setAuthenticationFailureHandler(new FailureHandler());

        ObjectMapper objectMapper = new ObjectMapper();

        http.authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/user/login").permitAll()
                        .requestMatchers("/api/user/register").permitAll()
                        .requestMatchers("/api/search/list").permitAll()
                        .requestMatchers("/api/search/detail").permitAll()
                        .requestMatchers("/api/search/related").permitAll()
                        .requestMatchers("/api/ai/**").permitAll()
                        .requestMatchers("/api/word-cloud/**").permitAll()
                        .requestMatchers("/api/graph/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("api-docs/**").permitAll()
                        .anyRequest().authenticated())
                // TODO: set csrf
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .httpBasic(basic -> basic.authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    PrintWriter out = response.getWriter();
                    Response<Void> ret = new Response<>(false, null, HttpStatus.UNAUTHORIZED.value(), "User not " +
                            "logged in.");
                    out.write(objectMapper.writeValueAsString(ret));
                    out.flush();
                    out.close();
                }))
                .rememberMe(remember -> remember.rememberMeServices(rememberMeServices()))
                .logout(logout -> logout.logoutUrl("/api/user/logout").logoutSuccessHandler((request, response,
                                                                                             authentication) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_OK);
                    PrintWriter out = response.getWriter();
                    Response<Void> ret = new Response<>(true, null, HttpStatus.OK.value(), null);
                    out.write(objectMapper.writeValueAsString(ret));
                    out.flush();
                    out.close();
                }).deleteCookies("remember-me"))
                .addFilterBefore(authenticationFilter, BasicAuthenticationFilter.class)
                // 用于包装请求，原始请求无法重复读取body，不知道是什么诡异设计
                .addFilterBefore(new HttpRequestFilter(), AuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(new LoginAuthenticationProvider(userService), rememberMeAuthenticationProvider());
    }

    @Bean
    public RememberMeAuthenticationFilter rememberMeFilter() {
        return new RememberMeAuthenticationFilter(authenticationManager(), rememberMeServices());
    }

    @Bean
    public RememberMeService rememberMeServices() {
        return new RememberMeService(key, new UserDetailsServiceImpl(userService), cookieDomain);
    }

    @Bean
    public RememberMeAuthenticationProvider rememberMeAuthenticationProvider() {
        return new RememberMeAuthenticationProvider(key);
    }

    @Service
    public static class UserDetailsServiceImpl implements UserDetailsService {

        private final UserService userService;

        @Autowired
        public UserDetailsServiceImpl(UserService userService) {
            this.userService = userService;
        }

        @Override
        public User loadUserByUsername(String id) throws UsernameNotFoundException {
            team.semg04.themirroroflaw.user.entity.User user = userService.getById(id);
            if (user == null) {
                throw new UsernameNotFoundException("User not found.");
            }
            return new User(user.getId().toString(), user.getPassword(), createAuthorityList("USER"));
        }
    }

    public static class SuccessHandler implements AuthenticationSuccessHandler {

        private final UserService userService;

        public SuccessHandler(UserService userService) {
            this.userService = userService;
        }

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                            Authentication authentication) throws IOException {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_OK);

            // get UserInfo
            String id = authentication.getName();
            team.semg04.themirroroflaw.user.entity.User user = userService.getById(id);
            List<String> history = new ArrayList<>(user.getHistoryAsSet());
            if (history.size() > 10) {
                history = history.subList(history.size() - 10, history.size());
            }
            Collections.reverse(history);
            UserController.UserInfo userInfo = new UserController.UserInfo(user.getId(), user.getUsername(),
                    user.getEmail(), history.toArray(new String[0]),
                    user.getLikeAsList().toArray(new String[0]), user.getDislikeAsList().toArray(new String[0]));

            PrintWriter out = response.getWriter();
            Response<UserController.UserInfo> ret = new Response<>(true, userInfo, 0, null);
            out.write(new ObjectMapper().writeValueAsString(ret));
            out.flush();
            out.close();
        }
    }

    @Slf4j
    public static class FailureHandler implements AuthenticationFailureHandler {

        @Override
        public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                            AuthenticationException exception) throws IOException {
            log.warn("Authentication failure: " + exception.getMessage());
            response.setContentType("application/json;charset=UTF-8");
            Response<Void> ret = new Response<>(false, null, null, null);
            PrintWriter out = response.getWriter();

            if (exception instanceof BadCredentialsException) {
                switch (exception.getMessage()) {
                    case "User not found.":
                        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        ret.setErrorCode(2);
                        ret.setErrorMessage("User not found.");
                        break;

                    case "Wrong password.":
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        ret.setErrorCode(1);
                        ret.setErrorMessage("Wrong password.");
                        break;

                    case "Email is null.":
                    case "Password is null.":
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        ret.setErrorCode(HttpStatus.BAD_REQUEST.value());
                        ret.setErrorMessage(exception.getMessage());
                        break;

                    default:
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        ret.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                        ret.setErrorMessage("Internal server error.");
                        break;
                }
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                ret.setErrorCode(HttpStatus.UNAUTHORIZED.value());
                ret.setErrorMessage("User not logged in.");
            }
            out.write(new ObjectMapper().writeValueAsString(ret));
            out.flush();
            out.close();
        }
    }
}
