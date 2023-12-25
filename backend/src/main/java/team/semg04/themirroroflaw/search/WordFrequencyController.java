package team.semg04.themirroroflaw.search;

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

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/word-cloud")
@Tag(name = "wordCloud", description = "词频分析接口")
public class WordFrequencyController {
    private ElasticsearchOperations elasticsearchOperations;
    @Autowired
    public void setElasticsearchOperations(ElasticsearchOperations elasticsearchOperations) {
        this.elasticsearchOperations = elasticsearchOperations;
    }

    @Operation(summary = "获取词云图信息", description = "前端发送请求获取该文档的一些关键词信息（关键词名称及权重）")
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
    @GetMapping("/get")
    public ResponseEntity<Response<List<Map<String, Object>> >> summarizeInfo(@RequestParam(name = "id") String id, @RequestParam(name = "type") Integer typeInt) {
        List<Map<String, Object>> wordFrequencyList;
        try {
            if(typeInt == DocumentType.LAW.ordinal() || typeInt == DocumentType.JUDGEMENT.ordinal()) {
                MirrorOfLaw laws = elasticsearchOperations.get(id, MirrorOfLaw.class);
                if (laws == null) {
                    log.error("Get search result detail error: Document not found. Id: " + id);
                    return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.value(),
                            "Document not found."), HttpStatus.NOT_FOUND);
                }
                wordFrequencyList = LawFrequencyAnalyzer.getAnalyzedJson(laws.getContent());
            } else {
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.value(), "Invalid " +
                        "type."), HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(new Response<>(true, wordFrequencyList, 0, ""), HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public enum DocumentType {
        LAW, JUDGEMENT
    }

}
