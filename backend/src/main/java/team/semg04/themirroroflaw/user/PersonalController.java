package team.semg04.themirroroflaw.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import team.semg04.themirroroflaw.Response;
import team.semg04.themirroroflaw.user.entity.User;
import team.semg04.themirroroflaw.user.service.UserService;
import team.semg04.themirroroflaw.user.utils.RememberMeService;

import java.util.List;

import static team.semg04.themirroroflaw.user.UserController.getCurrentUser;

@Slf4j
@RestController
@RequestMapping("/api/personal")
@Tag(name = "Personal", description = "个性化相关内容")
public class PersonalController {
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

    @Operation(summary = "获取个人历史记录", description = "获取个人历史记录")
    @Parameter(name = "reqNumber", description = "请求的历史记录数量")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "401", description = "未登录", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @GetMapping("/history")
    public ResponseEntity<Response<List<String>>> history(@RequestParam Integer reqNumber, HttpServletRequest request
            , HttpServletResponse response) {
        try {
            try {
                User user = getCurrentUser(request, response, userService, rememberMeService);
                List<String> history = List.copyOf(user.getHistoryAsSet());
                log.debug("Get personal history: " + history);
                return new ResponseEntity<>(new Response<>(true, history.subList(0, Math.min(history.size(), reqNumber))
                        , 0, "Success."), HttpStatus.OK);
            } catch (Exception e) {
                log.warn("Get personal history error: User not found." + e.getMessage());
                return new ResponseEntity<>(new Response<>(false, null, 1, "Not logged in yet!"),
                        HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            log.error("Get personal history error: ", e);
            return ResponseEntity.status(500).body(new Response<>(false, null, 500, "Internal server error."));
        }
    }
}
