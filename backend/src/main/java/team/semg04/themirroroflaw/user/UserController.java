package team.semg04.themirroroflaw.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.semg04.themirroroflaw.Response;
import team.semg04.themirroroflaw.user.entity.User;
import team.semg04.themirroroflaw.user.service.UserService;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/user")
@Tag(name = "User", description = "用户信息处理")
public class UserController {

    private UserService userService;

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "获取用户信息", description = "尝试向后端获取当前用户的信息，若拥有登录态则可以直接获取。")
    @Parameters({
            @Parameter(name = "id", description = "用户的id")
    })
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "404", description = "内容不存在", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @GetMapping("/info")
    // 登录状态的保存我们是不是还没商量好，这边只是先尝试和数据库的连接，最终id可能是从cookie中获取的QAQ
    // 还有历史记录的储存格式也可以商量一下（
    public ResponseEntity<Response<UserInfo>> userInfo(@RequestParam(name = "id") Integer id) {
        try {
            User user = userService.selectUser(id);
            if (user == null) {
                log.error("Get user info error: UserInfo not found. Id: " + id);
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.toString(),
                        "UserInfo not found."), HttpStatus.NOT_FOUND);
            }
            UserInfo userInfo = new UserInfo();
            userInfo.setEmail(user.getEmail());
            userInfo.setUsername(user.getUsername());
            userInfo.setId(user.getId());
            return new ResponseEntity<>(new Response<>(true, userInfo, "0", "Success."),
                    HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.toString(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @Data
    public static class UserInfo {
        private Integer id;
        private String username;
        private String email;
        private String[] history;
    }
}
