package team.semg04.themirroroflaw.search;

import co.elastic.clients.json.JsonData;
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
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.FetchSourceFilterBuilder;
import org.springframework.data.elasticsearch.core.query.HighlightQuery;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.core.query.highlight.Highlight;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightField;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightParameters;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import team.semg04.themirroroflaw.Response;
import team.semg04.themirroroflaw.search.data.LawsData;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/search")
@Tag(name = "Search", description = "搜索结果处理")
public class SearchController {

    private ElasticsearchOperations elasticsearchOperations;

    @Autowired
    public void setElasticsearchOperations(ElasticsearchOperations elasticsearchOperations) {
        this.elasticsearchOperations = elasticsearchOperations;
    }

    @Operation(summary = "搜索结果列表展示", description =
            "对于给定的输入量和筛选条件（包括搜索类型、高级搜索中的规定），返回以合适的顺序完成排序的搜索结果列表，为方便查看，采用分页展示。")
    @Parameters({
            @Parameter(name = "input", description = "用户在输入框中输入的内容"),
            @Parameter(name = "searchType", description = "搜索类型"),
            @Parameter(name = "resultType", description = "结果类型"),
            @Parameter(name = "startTime", description = "起始时间，年份≤-9999表示无限制"),
            @Parameter(name = "endTime", description = "终止时间，年份≥9999表示无限制"),
            @Parameter(name = "pageSize", description = "每页条数"),
            @Parameter(name = "pageNumber", description = "第x页，从0开始")
    })
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "400", description = "请求参数错误", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @GetMapping("/list")
    public ResponseEntity<Response<SearchList>> searchLaws(@RequestParam(name = "input") String input,
                                                           @RequestParam(name = "searchType", required = false,
                                                                   defaultValue = "ALL") SearchType searchType,
                                                           @RequestParam(name = "resultType") List<ResultType> resultType,
                                                           @RequestParam(name = "startTime", required = false,
                                                                   defaultValue = "-9999-01-01") LocalDate startTime,
                                                           @RequestParam(name = "endTime", required = false,
                                                                   defaultValue = "9999-12-31") LocalDate endTime,
                                                           @RequestParam(name = "pageSize", required = false,
                                                                   defaultValue = "10") Integer pageSize,
                                                           @RequestParam(name = "pageNumber", required = false,
                                                                   defaultValue = "0") Integer pageNumber) {
        try {
            // Check parameters
            if (pageSize <= 0 || pageSize > 50) {
                log.error("Get search result list error: Invalid pageSize. pageSize: " + pageSize);
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.toString(),
                        "Invalid pageSize. PageSize should be in range [1, 50]."), HttpStatus.BAD_REQUEST);
            }
            if (pageNumber < 0 || pageNumber + pageSize > 10000) {
                log.error("Get search result list error: Invalid pageNumber. pageNumber: " + pageNumber);
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.toString(),
                        "Invalid pageNumber. PageNumber should be in range [0, 10000 - pageSize]."),
                        HttpStatus.BAD_REQUEST);
            }

            // Initialize result list
            SearchList searchList = new SearchList();
            searchList.setResults(new ArrayList<>());
            searchList.setTotal(0);

            Pageable pageable = Pageable.ofSize(pageSize).withPage(pageNumber);
            HighlightParameters highlightParameters =
                    HighlightParameters.builder().withBoundaryScannerLocale("zh-cn")
                            .withBoundaryChars(".,!?; \t\n，。！？；、").withPreTags("").withPostTags("").build();
            for (ResultType type : resultType) {
                if (type == ResultType.LAW) {
                    List<String> fields = switch (searchType) {
                        case ALL -> List.of("content", "title^3");
                        case TITLE -> List.of("title");
                        case SOURCE -> List.of("office");
                    };
                    List<HighlightField> highlightFields = List.of(new HighlightField("content"));
                    NativeQueryBuilder nativeQueryBuilder =
                            NativeQuery.builder().withQuery(query -> query.multiMatch(multiMatch -> multiMatch.query(input).fields(fields)
                                            .analyzer("ik_smart")))
                                    .withSourceFilter(new FetchSourceFilterBuilder().withIncludes("id", "title",
                                            "publish", "office", "like", "dislike").build())
                                    .withHighlightQuery(new HighlightQuery(new Highlight(highlightParameters,
                                            highlightFields), null))    // HighlightQuery的第二个参数我不知道是干啥的，反正放个null也行
                                    .withPageable(pageable);
                    if (startTime.isAfter(LocalDate.ofYearDay(-9999, 365))) {
                        nativeQueryBuilder.withFilter(filter -> filter.range(range -> range.field("publish")
                                .gte(JsonData.of(startTime.toString()))));
                    }
                    if (endTime.isBefore(LocalDate.ofYearDay(9999, 1))) {
                        nativeQueryBuilder.withFilter(filter -> filter.range(range -> range.field("publish")
                                .lte(JsonData.of(endTime.toString()))));
                    }
                    Query searchQuery = nativeQueryBuilder.build();
                    SearchHits<LawsData> lawsData = elasticsearchOperations.search(searchQuery, LawsData.class);
                    searchList.setTotal(searchList.getTotal() + (int) lawsData.getTotalHits());
                    for (SearchHit<LawsData> data : lawsData) {
                        SearchList.ResultItem resultItem = new SearchList.ResultItem();
                        resultItem.setId(data.getContent().getId());
                        resultItem.setTitle(data.getContent().getTitle());
                        if (searchType == SearchType.ALL) {
                            resultItem.setDescription(String.join("...", data.getHighlightField("content")).replaceAll(
                                    "\n", ""));
                        } else {
                            resultItem.setDescription(data.getContent().getContent().substring(0, 200).replaceAll("\n"
                                    , ""));
                        }
                        resultItem.setDate(data.getContent().getPublish());
                        resultItem.setSource(data.getContent().getOffice());
                        resultItem.setResultType(ResultType.LAW.ordinal());
                        resultItem.setFeedbackCnt(new FeedbackCnt());
                        resultItem.getFeedbackCnt().setLikes(data.getContent().getLike());
                        resultItem.getFeedbackCnt().setDislikes(data.getContent().getDislike());
                        searchList.getResults().add(resultItem);
                    }
                } else if (type == ResultType.JUDGEMENT) {
                    return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.toString(), "Not " +
                            "implemented."), HttpStatus.BAD_REQUEST);
                }
            }
            log.info("Get search result list success. Total: " + searchList.getTotal());
            return new ResponseEntity<>(new Response<>(true, searchList, "0", "Success."),
                    HttpStatus.OK);
        } catch (Exception e) {
            log.error("Get search result list error: " + e.getMessage());
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.toString(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "结果详情展示", description = "用户点击搜索结果列表中的某一条后，即可进入详情页查看详细内容，这些内容应以合适的格式整理并呈现。")
    @Parameters({
            @Parameter(name = "id", description = "内容的id")
    })
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "404", description = "内容不存在", content = @Content(schema =
            @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @GetMapping("/detail")
    public ResponseEntity<Response<Detail>> searchDetail(@RequestParam(name = "id") String id) {
        try {
            Detail detail = new Detail();
            LawsData lawsData = elasticsearchOperations.get(id, LawsData.class);
            if (lawsData == null) {
                log.error("Get search result detail error: LawsData not found. Id: " + id);
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.toString(),
                        "LawsData not found."), HttpStatus.NOT_FOUND);
            }
            detail.setTitle(lawsData.getTitle());
            detail.setSource(lawsData.getOffice());
            detail.setPublishTime(lawsData.getPublish());
            detail.setFeedbackCnt(new FeedbackCnt());
            detail.getFeedbackCnt().setLikes(lawsData.getLike());
            detail.getFeedbackCnt().setDislikes(lawsData.getDislike());
            detail.setContent(lawsData.getContent());
            detail.setResultType(ResultType.LAW.ordinal());
            detail.setLink(lawsData.getUrl());
            log.info("Get search result detail success. Id: " + id);
            return new ResponseEntity<>(new Response<>(true, detail, "0", "Success."),
                    HttpStatus.OK);
        } catch (Exception e) {
            log.error("Get search result detail error: " + e.getMessage());
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.toString(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public enum SearchType {
        ALL, TITLE, SOURCE
    }

    public enum ResultType {
        LAW, JUDGEMENT
    }

    @Data
    public static class Detail {
        private String title;
        private String source;
        private LocalDate publishTime;
        private FeedbackCnt feedbackCnt;
        private String content;
        private Integer resultType;
        private String link;
    }

    @Data
    public static class SearchList {
        private List<ResultItem> results;
        private Integer total;

        @Data
        public static class ResultItem {
            private String id;
            private String title;
            private String description;
            private LocalDate date;
            private Integer resultType;
            private String source;
            private FeedbackCnt feedbackCnt;
        }
    }

    @Data
    public static class FeedbackCnt {
        private Integer likes;
        private Integer dislikes;
    }
}
