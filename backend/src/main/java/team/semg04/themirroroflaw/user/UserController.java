package team.semg04.themirroroflaw.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import team.semg04.themirroroflaw.Response;
import team.semg04.themirroroflaw.user.entity.User;
import team.semg04.themirroroflaw.user.service.UserService;
import team.semg04.themirroroflaw.user.utils.RememberMeService;

@Slf4j
@RestController
@RequestMapping("/api/user")
@Tag(name = "User", description = "用户信息处理")
public class UserController {

    private UserService userService;

    private RememberMeService rememberMeService;

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    @Autowired
    public void setRememberMeService(RememberMeService rememberMeService) {
        this.rememberMeService = rememberMeService;
    }

    private Boolean validateUsername(String username) {
        return username.matches("^[a-zA-Z0-9_-]{5,20}$");
    }

    private Boolean validatePassword(String password) {
        return password.matches("^[a-zA-Z0-9_-]{5,20}$");
    }

    private Boolean validateEmail(String email) {
        return email.matches("^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$");
    }

    @Operation(summary = "用户注册", description = "用户注册，用户名和密码长度在5-20位，只能包含字母、数字、下划线和减号，邮箱格式必须正确，用户名与邮箱不能重复。")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "成功"),
            @ApiResponse(responseCode = "400", description = "用户名、密码或邮箱不合法", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "409", description = "用户名或邮箱已存在", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<Response<String>> register(@RequestBody UserRegister userRegister) {
        try {
            if (!validateUsername(userRegister.getUserName())) {
                log.error("User register error: Username not valid. Username: " + userRegister.getUserName());
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.value(),
                        "Username not valid."), HttpStatus.BAD_REQUEST);
            }
            if (!validatePassword(userRegister.getPassword())) {
                log.error("User register error: Password not valid. Password: " + userRegister.getPassword());
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.value(),
                        "Password not valid."), HttpStatus.BAD_REQUEST);
            }
            if (!validateEmail(userRegister.getEmail())) {
                log.error("User register error: Email not valid. Email: " + userRegister.getEmail());
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.value(),
                        "Email not valid."), HttpStatus.BAD_REQUEST);
            }

            // hash password
            PasswordEncoder passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
            userRegister.password = passwordEncoder.encode(userRegister.password);

            User user = new User();
            user.setUsername(userRegister.getUserName());
            user.setPassword(userRegister.getPassword());
            user.setEmail(userRegister.getEmail());
            userService.save(user);

            log.info("User register success. Username: " + userRegister.getUserName());
            return new ResponseEntity<>(new Response<>(true, null, 0, "Register success."), HttpStatus.CREATED);
        } catch (Exception e) {
            if (e.getMessage().contains("Duplicate entry")) {
                String duplicate = e.getMessage().split("'")[3].split("\\.")[1];
                log.error("User register error: Duplicate entry. Duplicate: " + duplicate);
                return new ResponseEntity<>(new Response<>(false, null, duplicate.equals("username") ? 2 : 1,
                        duplicate + " already exists!"), HttpStatus.CONFLICT);
            }

            log.error("User register error: " + e.getMessage());
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 用户登录和用户登出的响应会被Spring Security截获，这里的代码只是为了让Swagger生成文档。
    // 具体逻辑请见SpringSecurityConfig.java以及team.semg04.themirroroflaw.user.utils软件包内代码。
    @Operation(summary = "用户登录", description = "用户登录。")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "401", description = "用户名或密码错误", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<Response<UserInfo>> login(@RequestBody UserLogin userLogin) {
        return new ResponseEntity<>(new Response<>(false, null, HttpStatus.MOVED_PERMANENTLY.value(), null),
                HttpStatus.MOVED_PERMANENTLY);
    }

    @Operation(summary = "用户登出", description = "用户登出。")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @GetMapping("/logout")
    public ResponseEntity<Response<Void>> logout() {
        return new ResponseEntity<>(new Response<>(false, null, HttpStatus.MOVED_PERMANENTLY.value(), null),
                HttpStatus.MOVED_PERMANENTLY);
    }

    @Operation(summary = "获取用户信息", description = "获取用户信息。")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @GetMapping("/info")
    public ResponseEntity<Response<UserInfo>> getUserInfo(HttpServletRequest request, HttpServletResponse response) {
        try {
            try {
                User user = getCurrentUser(request, response);
                UserInfo userInfo = new UserInfo(user.getId(), user.getUsername(), user.getEmail(), null);
                // TODO: get history
                return new ResponseEntity<>(new Response<>(true, userInfo, 0, null), HttpStatus.OK);
            } catch (Exception e) {
                log.error("Get user info failed: User not found." + e.getMessage());
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.value(),
                        "User not found."), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Get user info failed: " + e.getMessage());
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 根据请求中的Cookie获取当前用户
    public User getCurrentUser(HttpServletRequest request, HttpServletResponse response) {
        Authentication data = rememberMeService.autoLogin(request, response);
        if (data != null) {
            String id = ((org.springframework.security.core.userdetails.User) data.getPrincipal()).getUsername();
            User user = userService.getById(id);
            if (user == null) {
                throw new RuntimeException("User not found");
            } else {
                return user;
            }
        } else {
            throw new RuntimeException("User not found");
        }
    }

    @Operation(summary = "修改用户信息", description = "修改用户信息。")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "400", description = "用户名、密码或邮箱不合法", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "404", description = "用户不存在", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "409", description = "用户名或邮箱已存在", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @PutMapping("/modify/info")
    public ResponseEntity<Response<Void>> modifyUserInfo(@RequestBody UserModify userModify,
                                                         HttpServletRequest request, HttpServletResponse response) {
        try {
            try {
                User user = getCurrentUser(request, response);

                // validate username and email
                if (!validateUsername(userModify.getUserName())) {
                    log.error("User modify error: Username not valid. Username: " + userModify.getUserName());
                    return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.value(),
                            "Username not valid."), HttpStatus.BAD_REQUEST);
                }
                if (!validateEmail(userModify.getEmail())) {
                    log.error("User modify error: Email not valid. Email: " + userModify.getEmail());
                    return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.value(),
                            "Email not valid."), HttpStatus.BAD_REQUEST);
                }


                // check if username or email already exists
                User userWithSameUsername = userService.getByUsername(userModify.getUserName());
                User userWithSameEmail = userService.getByEmail(userModify.getEmail());
                if (userWithSameUsername != null && !userWithSameUsername.getId().equals(user.getId())) {
                    log.error("User modify error: Username already exists. Username: " + userModify.getUserName());
                    return new ResponseEntity<>(new Response<>(false, null, HttpStatus.CONFLICT.value(),
                            "Username already exists."), HttpStatus.CONFLICT);
                }
                if (userWithSameEmail != null && !userWithSameEmail.getId().equals(user.getId())) {
                    log.error("User modify error: Email already exists. Email: " + userModify.getEmail());
                    return new ResponseEntity<>(new Response<>(false, null, HttpStatus.CONFLICT.value(),
                            "Email already exists."), HttpStatus.CONFLICT);
                }

                // update user info
                user.setUsername(userModify.getUserName());
                user.setEmail(userModify.getEmail());
                userService.updateById(user);

                log.info("User modify success.");
                return new ResponseEntity<>(new Response<>(true, null, 0, null), HttpStatus.OK);
            } catch (Exception e) {
                log.error("User modify error: User not found." + e.getMessage());
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.value(),
                        "User not found."), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Modify user info failed: " + e.getMessage());
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "修改用户密码", description = "修改用户密码。")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "400", description = "密码不合法", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "401", description = "密码错误", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "404", description = "用户不存在", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @PutMapping("/modify/password")
    public ResponseEntity<Response<Void>> modifyUserPassword(@RequestBody UserModifyPassword userModifyPassword,
                                                             HttpServletRequest request, HttpServletResponse response) {
        try {
            try {
                User user = getCurrentUser(request, response);

                // validate password
                if (!validatePassword(userModifyPassword.getNewPassword())) {
                    log.error("User modify error: Password not valid. Password: " + userModifyPassword.getNewPassword());
                    return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.value(),
                            "Password not valid."), HttpStatus.BAD_REQUEST);
                }

                // check if old password is correct
                PasswordEncoder passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
                if (!passwordEncoder.matches(userModifyPassword.getOldPassword(), user.getPassword())) {
                    log.error("User modify error: Old password not correct.");
                    return new ResponseEntity<>(new Response<>(false, null, HttpStatus.UNAUTHORIZED.value(),
                            "Old password not correct."), HttpStatus.UNAUTHORIZED);
                }

                // delete remember-me cookie
                rememberMeService.logout(request, response, null);

                // update user password
                user.setPassword(passwordEncoder.encode(userModifyPassword.getNewPassword()));
                userService.updateById(user);

                log.info("User modify success.");
                return new ResponseEntity<>(new Response<>(true, null, 0, null), HttpStatus.OK);
            } catch (Exception e) {
                log.error("User modify error: User not found." + e.getMessage());
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.value(),
                        "User not found."), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Modify user password failed: " + e.getMessage());
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "删除用户", description = "删除用户。")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "404", description = "用户不存在", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @DeleteMapping("/delete")
    public ResponseEntity<Response<Void>> deleteUser(HttpServletRequest request, HttpServletResponse response) {
        try {
            try {
                User user = getCurrentUser(request, response);

                // delete remember-me cookie
                rememberMeService.logout(request, response, null);

                // delete user
                userService.removeById(user);

                log.info("User delete success.");
                return new ResponseEntity<>(new Response<>(true, null, 0, null), HttpStatus.OK);
            } catch (Exception e) {
                log.error("User delete error: User not found." + e.getMessage());
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.value(),
                        "User not found."), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Delete user failed: " + e.getMessage());
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Data
    public static class UserModifyPassword {
        private String oldPassword;
        private String newPassword;
    }

    @Data
    public static class UserModify {
        private String userName;
        private String email;
    }

    @Data
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String userName;
        private String email;
        private String[] history;
    }

    @Data
    public static class UserRegister {
        private String userName;
        private String password;
        private String email;
    }

    @Data
    public static class UserLogin {
        private String email;
        private String password;
        private Boolean rememberMe = true;
    }
}
