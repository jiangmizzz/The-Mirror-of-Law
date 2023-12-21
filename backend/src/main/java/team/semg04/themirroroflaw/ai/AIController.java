package team.semg04.themirroroflaw.ai;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import team.semg04.themirroroflaw.Response;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "AI相关接口")
public class AIController {

    private static final String extractPrompt = "请从我下面所给出的这段文字中，提取3~5个关键词，并且尽可能使用法律领域相关的专有名词或术语，" +
            "用于优化其在搜索引擎中的检索效果。你的回答不应包含任何多余的内容，只需要将这些关键词通过';'进行分割作为回复即可，例如'故意伤人;宪法;无期徒刑'。\n" +
            "文字内容：";

    @Operation(summary = "关键词提取", description = "用户输入一段文字，返回这段文字中提取出的若干关键词")
    @Parameters({
            @Parameter(name = "input", description = "待处理的文字")
    })
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "404", description = "内容不存在", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @GetMapping("/extract")
    public ResponseEntity<Response<String>> userInfo(@RequestParam(name = "input") String input) {
        String result;
        try {
            result = SparkModelConnector.getAnswer(extractPrompt + input);
            result = result.replace(" ", "").replace("；", ";");
            return new ResponseEntity<>(new Response<>(true, result, 0, ""), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
