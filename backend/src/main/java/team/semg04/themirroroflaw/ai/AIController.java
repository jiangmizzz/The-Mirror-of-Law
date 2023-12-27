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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import team.semg04.themirroroflaw.Response;
import team.semg04.themirroroflaw.search.entity.MirrorOfLaw;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "AI相关接口")
public class AIController {

    private static final String extractPrompt = "请从我下面所给出的这段文字中，提取3~5个关键词，并且尽可能使用法律领域相关的专有名词或术语，" +
            "用于优化其在搜索引擎中的检索效果。你的回答不应包含任何多余的内容，只需要将这些关键词通过';'进行分割作为回复即可，例如'故意伤人;宪法;无期徒刑'," +
            "且回答内容应与文字内容贴合。\n" + "文字内容：";
    private static final String summarizePrompt = "请对我下面所给出的这段文字进行总结，在尽可能保留大意的情况下，将其总结为不超过300字的摘要," +
            "你的回答应当只包含总结的内容，而不该出现‘好的’、‘收到’等无意义的回应：\n";

    private ElasticsearchOperations elasticsearchOperations;

    @Autowired
    public void setElasticsearchOperations(ElasticsearchOperations elasticsearchOperations) {
        this.elasticsearchOperations = elasticsearchOperations;
    }

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
    public ResponseEntity<Response<String>> extractKeyword(@RequestParam(name = "input") String input) {
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

    @Operation(summary = "文档总结", description = "对当前⽂档内容进⾏总结，⽣成⼀段⽂字概要（考虑对不同类型的⽂章⽣成合适的概要形式）")
    @Parameters({
            @Parameter(name = "id", description = "文档id"),
            @Parameter(name = "type", description = "文档类型")
    })
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "400", description = "请求参数错误", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "404", description = "内容不存在", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @GetMapping("/summarize")
    public ResponseEntity<Response<String>> summarizeInfo(@RequestParam(name = "id") String id, @RequestParam(name =
            "type") Integer typeInt) {
        String result;
        boolean tooLong = false;
        String tooLongMessage = "文档内容过长，已自动截取部分内容进行总结：\n";
        String sensitiveMessage = "文档可能包含敏感信息，无法进行总结！";
        try {
            if (typeInt == DocumentType.LAW.ordinal() || typeInt == DocumentType.JUDGEMENT.ordinal()) {
                MirrorOfLaw laws = elasticsearchOperations.get(id, MirrorOfLaw.class);
                if (laws == null) {
                    log.error("Get search result detail error: Document not found. Id: " + id);
                    return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.value(),
                            "Document not found."), HttpStatus.NOT_FOUND);
                }
                if (laws.getContent().length() >= 4096 - summarizePrompt.length()) {
                    laws.setContent(laws.getContent().substring(0, 4096 - summarizePrompt.length()));
                    tooLong = true;
                }
                result = SparkModelConnector.getAnswer(summarizePrompt + laws.getContent());
                if (result.isEmpty()) {
                    return new ResponseEntity<>(new Response<>(true, sensitiveMessage, 0, ""), HttpStatus.OK);
                }
            } else {
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.value(), "Invalid " +
                        "type."), HttpStatus.BAD_REQUEST);
            }
            if (!tooLong) {
                return new ResponseEntity<>(new Response<>(true, result, 0, ""), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(new Response<>(true, tooLongMessage + result, 0, ""), HttpStatus.OK);
            }

        } catch (Exception e) {
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public enum DocumentType {
        LAW, JUDGEMENT
    }

}
