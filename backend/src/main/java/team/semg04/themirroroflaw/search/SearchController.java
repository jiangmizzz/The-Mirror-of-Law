package team.semg04.themirroroflaw.search;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.SearchTemplateQuery;
import org.springframework.data.elasticsearch.core.script.Script;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.semg04.themirroroflaw.Response;
import team.semg04.themirroroflaw.search.entity.MirrorOfLaw;
import team.semg04.themirroroflaw.user.entity.User;
import team.semg04.themirroroflaw.user.service.UserService;
import team.semg04.themirroroflaw.user.utils.RememberMeService;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import static java.lang.System.exit;
import static team.semg04.themirroroflaw.user.UserController.getCurrentUser;

@Slf4j
@RestController
@RequestMapping("/api/search")
@Tag(name = "Search", description = "搜索结果处理")
public class SearchController {

    private ElasticsearchOperations elasticsearchOperations;
    private UserService userService;

    private RememberMeService rememberMeService;

    private static void validatePageable(Integer pageSize, Integer pageNumber) {
        // Check parameters
        if (pageSize <= 0 || pageSize > 50) {
            log.warn("Get search result list error: Invalid pageSize. pageSize: " + pageSize);
            throw new IllegalArgumentException("Invalid pageSize. PageSize should be in range [1, 50].");

        }
        if (pageNumber < 0 || pageNumber + pageSize > 10000) {
            log.warn("Get search result list error: Invalid pageNumber. pageNumber: " + pageNumber);
            throw new IllegalArgumentException("Invalid pageNumber. PageNumber should be in range [0, 10000 - " +
                    "pageSize].");
        }
    }

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    @Autowired
    public void setRememberMeService(RememberMeService rememberMeService) {
        this.rememberMeService = rememberMeService;
    }

    @Autowired
    public void setElasticsearchOperations(ElasticsearchOperations elasticsearchOperations) {
        this.elasticsearchOperations = elasticsearchOperations;
        init();
    }

    public void init() {
        Script allScript = Script.builder().withId("search_by_all").withLanguage("mustache").withSource("""
                {
                  "_source": {
                    "includes": ["id","type","title","date","source","like","dislike"]
                  },
                  "highlight": {
                    "boundary_chars": "{{{boundary_chars}}}",
                    "boundary_scanner_locale": "zh-cn",
                    "pre_tags": [""],
                    "post_tags": [""],
                    "fields": {
                      "content": {}
                    }
                  },
                  "post_filter": {
                    "range": {
                      "date": {
                        "gte": "{{{startTime}}}",
                        "lte": "{{{endTime}}}"
                      }
                    }
                  },
                  "query": {
                    "bool": {
                      "must": [
                                {
                                  "multi_match": {
                                    "query": "{{{input}}}",
                                    "fields": ["content", "title^3"],
                                    "analyzer": "ik_smart"
                                  }
                                },
                                {
                                  "terms": {
                                    "type": {{{type}}}
                                  }
                                }
                              ],
                      "should": {
                          "multi_match": {
                          "query": "中华人民共和国",
                          "fields": ["title"],
                          "analyzer": "ik_smart",
                          "boost": 2
                          }
                      }
                    }
                  },
                  "track_scores": true,
                  "sort": [
                     {"_score": "desc"},
                     {"date": "desc"},
                     {"like": "desc"},
                     {"dislike": "asc"}
                  ],
                  "size": {{{size}}},
                  "from": {{{from}}}
                }""").build();
        Script singleScript = Script.builder().withId("search_by_single").withLanguage("mustache").withSource("""
                {
                  "_source": {
                    "includes": ["id","type","title","date","source","like","dislike"]
                  },
                  "highlight": {
                    "boundary_chars": "{{{boundary_chars}}}",
                    "boundary_scanner_locale": "zh-cn",
                    "pre_tags": [""],
                    "post_tags": [""],
                    "fields": {
                      "content": {
                        "highlight_query": {
                          "bool": {
                            "must": [
                                {
                                  "multi_match": {
                                    "query": "{{{input}}}",
                                    "fields": ["content"],
                                    "analyzer": "ik_smart"
                                  }
                                },
                                {
                                  "terms": {
                                    "type": {{{type}}}
                                  }
                                }
                              ]
                          }
                        }
                      }
                    }
                  },
                  "post_filter": {
                    "range": {
                      "date": {
                        "gte": "{{{startTime}}}",
                        "lte": "{{{endTime}}}"
                      }
                    }
                  },
                  "query": {
                    "bool": {
                      "must": [
                                {
                                  "multi_match": {
                                    "query": "{{{input}}}",
                                    "fields": ["{{{field}}}"],
                                    "analyzer": "ik_smart"
                                  }
                                },
                                {
                                  "terms": {
                                    "type": {{{type}}}
                                  }
                                }
                              ],
                      "should": {
                          "multi_match": {
                          "query": "中华人民共和国",
                          "fields": ["title"],
                          "analyzer": "ik_smart",
                          "boost": 2
                          }
                      }
                    }
                  },
                  "sort": [
                     {"_score": "desc"},
                     {"date": "desc"},
                     {"like": "desc"},
                     {"dislike": "asc"}
                  ],
                  "size": {{{size}}},
                  "from": {{{from}}}
                }""").build();
        Script moreLikeThis = Script.builder().withId("search_more_like_this").withLanguage("mustache").withSource("""
                {
                   "_source": {
                     "includes": ["id","type","title"]
                   },
                   "query": {
                     "more_like_this": {
                       "fields": ["title","content"],
                       "like": [
                         {
                           "_index": "mirror-of-law",
                           "_id": "{{{id}}}"
                         }
                       ]
                     }
                   },
                   "size": {{{size}}},
                   "from": {{{from}}}
                 }""").build();
        try {
            elasticsearchOperations.deleteScript("search_by_all");
            elasticsearchOperations.deleteScript("search_by_single");
            elasticsearchOperations.deleteScript("search_more_like_this");
            log.debug("Delete script success.");
        } catch (Exception e) {
            log.error("Delete script error: " + e.getMessage());
        }
        try {
            elasticsearchOperations.putScript(allScript);
            elasticsearchOperations.putScript(singleScript);
            elasticsearchOperations.putScript(moreLikeThis);
            log.debug("Put script success.");
        } catch (Exception e) {
            log.error("Put script error: " + e.getMessage());
            exit(-1);
        }
    }

    @Operation(summary = "搜索结果列表展示", description = "对于给定的输入量和筛选条件（包括搜索类型、高级搜索中的规定），返回以合适的顺序完成排序的搜索结果列表，为方便查看，采用分页展示。")
    @Parameters({@Parameter(name = "input", description = "用户在输入框中输入的内容"), @Parameter(name = "searchType",
            description = "搜索类型"), @Parameter(name = "resultType", description = "结果类型"), @Parameter(name =
            "startTime", description = "起始时间，年份≤-9999表示无限制"), @Parameter(name = "endTime", description =
            "终止时间，年份≥9999表示无限制"), @Parameter(name = "pageSize", description = "每页条数"), @Parameter(name = "pageNumber"
            , description = "第x页，从0开始")})
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "成功"), @ApiResponse(responseCode = "400",
            description = "请求参数错误", content = @Content(schema = @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))})
    @GetMapping("/list")
    public ResponseEntity<Response<SearchList>> searchLaws(@RequestParam(name = "input") String input,
                                                           @RequestParam(name = "searchType", required = false,
                                                                   defaultValue = "0") Integer searchTypeInt,
                                                           @RequestParam(name = "resultType") List<Integer> resultTypeInt,
                                                           @RequestParam(name = "startTime", required = false,
                                                                   defaultValue = "-9999-01-01") LocalDate startTime,
                                                           @RequestParam(name = "endTime", required = false,
                                                                   defaultValue = "9999-12-31") LocalDate endTime,
                                                           @RequestParam(name = "pageSize", required = false,
                                                                   defaultValue = "10") Integer pageSize,
                                                           @RequestParam(name = "pageNumber", required = false,
                                                                   defaultValue = "0") Integer pageNumber,
                                                           HttpServletRequest request, HttpServletResponse response) {
        try {
            try {
                validatePageable(pageSize, pageNumber);
            } catch (IllegalArgumentException e) {
                log.warn("Get search result list error: " + e.getMessage());
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.value(),
                        e.getMessage()), HttpStatus.BAD_REQUEST);
            }

            SearchType searchType = SearchType.values()[searchTypeInt];

            // Initialize result list
            SearchList searchList = new SearchList();
            searchList.setResults(new ArrayList<>());
            searchList.setTotal(0);

            Pageable pageable = Pageable.ofSize(pageSize).withPage(pageNumber);
            String boundary_chars = ".,!?; \\t\\n，。！？；、";

            String resultType = resultTypeInt.toString();

            String fields = switch (searchType) {
                case TITLE -> "title";
                case SOURCE -> "source";
                default -> "content";
            };
            SearchHits<MirrorOfLaw> searchResult;
            if (searchType == SearchType.ALL) {
                searchResult =
                        elasticsearchOperations.search(SearchTemplateQuery.builder().withId("search_by_all")
                                .withParams(Map.of("input", input, "startTime", startTime.toString(), "endTime",
                                        endTime.toString(), "size", pageable.getPageSize(), "from",
                                        pageable.getOffset(), "boundary_chars", boundary_chars, "type", resultType)).build(), MirrorOfLaw.class);
            } else {
                searchResult =
                        elasticsearchOperations.search(SearchTemplateQuery.builder().withId("search_by_single")
                                .withParams(Map.of("input", input, "field", fields, "startTime", startTime.toString()
                                        , "endTime", endTime.toString(), "size", pageable.getPageSize(), "from",
                                        pageable.getOffset(), "boundary_chars", boundary_chars, "type", resultType)).build(), MirrorOfLaw.class);
            }
            searchList.setTotal((int) searchResult.getTotalHits());
            for (SearchHit<MirrorOfLaw> data : searchResult) {
                SearchList.ResultItem resultItem = new SearchList.ResultItem();
                resultItem.setId(data.getContent().getId());
                resultItem.setTitle(data.getContent().getTitle());
                resultItem.setDescription(String.join("...", data.getHighlightField("content")).replaceAll("\n", ""));
                if (resultItem.getDescription().isEmpty()) {    // Highlight is empty 正文中可能没有关键词
                    MirrorOfLaw document = elasticsearchOperations.get(data.getContent().getId(), MirrorOfLaw.class);
                    if (document != null) {
                        String content = document.getContent();
                        if (content != null) {
                            resultItem.setDescription(content.substring(0, Math.min(content.length(), 200)));
                        }
                    }
                    if (resultItem.getDescription().isEmpty()) {    // Content is still empty(get content failed)
                        resultItem.setDescription("无内容");
                    }
                }
                resultItem.setDate(data.getContent().getDate());
                resultItem.setSource(data.getContent().getSource());
                resultItem.setResultType(data.getContent().getType());
                resultItem.setFeedbackCnt(new FeedbackCnt());
                resultItem.getFeedbackCnt().setLikes(data.getContent().getLike());
                resultItem.getFeedbackCnt().setDislikes(data.getContent().getDislike());
                resultItem.setScore(data.getScore());
                searchList.getResults().add(resultItem);
            }

            // add input into user history
            User user = null;
            try {
                user = getCurrentUser(request, response, userService, rememberMeService);
            } catch (Exception e) {
                log.debug("Get personal history error: User not found." + e.getMessage());
            }
            if (user != null) {
                LinkedHashSet<String> history = user.getHistoryAsSet();
                // if input already exists, remove it and add it to the end
                history.removeIf(input::equals);
                history.add(input);
                user.setHistoryFromSet(history);
                userService.updateById(user);
                log.debug("Add input into user history success. Input: " + input);
            }

            log.debug("Get search result list success. Total: " + searchList.getTotal());
            return new ResponseEntity<>(new Response<>(true, searchList, 0, ""), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Get search result list error: " + e.getMessage());
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "结果详情展示", description = "用户点击搜索结果列表中的某一条后，即可进入详情页查看详细内容，这些内容应以合适的格式整理并呈现。")
    @Parameters({@Parameter(name = "id", description = "内容的id"), @Parameter(name = "type", description = "内容的类型")})
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "成功"), @ApiResponse(responseCode = "404",
            description = "内容不存在", content = @Content(schema = @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))})
    @GetMapping("/detail")
    public ResponseEntity<Response<Detail>> searchDetail(@RequestParam(name = "id") String id, @RequestParam(name =
            "type") Integer type) {
        try {
            Detail detail = new Detail();
            MirrorOfLaw document = elasticsearchOperations.get(id, MirrorOfLaw.class);
            if (document == null) {
                log.warn("Get search result detail error: Document not found. Id: " + id);
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.value(),
                        "Document not " + "found."), HttpStatus.NOT_FOUND);
            }
            detail.setTitle(document.getTitle());
            detail.setSource(document.getSource());
            detail.setPublishTime(document.getDate());
            detail.setFeedbackCnt(new FeedbackCnt());
            detail.getFeedbackCnt().setLikes(document.getLike());
            detail.getFeedbackCnt().setDislikes(document.getDislike());
            detail.setContent(document.getContent());
            detail.setResultType(document.getType());
            detail.setLink(document.getUrl());

            // 裁判文书
            detail.setCause(document.getCause());
            detail.setCaseId(document.getCaseId());
            log.debug("Get search result detail success. Id: " + id);
            return new ResponseEntity<>(new Response<>(true, detail, 0, ""), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Get search result detail error: " + e.getMessage());
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "用户反馈", description = "用户对搜索结果的反馈，包括点赞和点踩。")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "成功"), @ApiResponse(responseCode = "404",
            description = "内容不存在", content = @Content(schema = @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))})
    @PostMapping("/feedback")
    public synchronized ResponseEntity<Response<Integer>> feedback(@RequestBody Feedback feedback,
                                                                   HttpServletRequest request,
                                                                   HttpServletResponse response) {
        try {
            // update in user's feedback
            User user;
            FeedbackType feedbackType;
            try {
                user = getCurrentUser(request, response, userService, rememberMeService);
            } catch (Exception e) {
                log.warn("Feedback error: User not found." + e.getMessage());
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.UNAUTHORIZED.value(), "Not logged "
                        + "in yet!"), HttpStatus.UNAUTHORIZED);
            }
            if (feedback.getFeedback()) {
                if (user.getLikeAsList().contains(feedback.getId())) {
                    feedbackType = FeedbackType.CANCEL_LIKE;
                    List<String> like = user.getLikeAsList();
                    like.remove(feedback.getId());
                    user.setLikeFromList(like);
                } else if (user.getDislikeAsList().contains(feedback.getId())) {
                    feedbackType = FeedbackType.DISLIKE_TO_LIKE;
                    List<String> dislike = user.getDislikeAsList();
                    dislike.remove(feedback.getId());
                    user.setDislikeFromList(dislike);
                    List<String> like = user.getLikeAsList();
                    like.add(feedback.getId());
                    user.setLikeFromList(like);
                } else {
                    feedbackType = FeedbackType.LIKE;
                    List<String> like = user.getLikeAsList();
                    like.add(feedback.getId());
                    user.setLikeFromList(like);
                }
            } else {
                if (user.getDislikeAsList().contains(feedback.getId())) {
                    feedbackType = FeedbackType.CANCEL_DISLIKE;
                    List<String> dislike = user.getDislikeAsList();
                    dislike.remove(feedback.getId());
                    user.setDislikeFromList(dislike);
                } else if (user.getLikeAsList().contains(feedback.getId())) {
                    feedbackType = FeedbackType.LIKE_TO_DISLIKE;
                    List<String> like = user.getLikeAsList();
                    like.remove(feedback.getId());
                    user.setLikeFromList(like);
                    List<String> dislike = user.getDislikeAsList();
                    dislike.add(feedback.getId());
                    user.setDislikeFromList(dislike);
                } else {
                    feedbackType = FeedbackType.DISLIKE;
                    List<String> dislike = user.getDislikeAsList();
                    dislike.add(feedback.getId());
                    user.setDislikeFromList(dislike);
                }
            }
            userService.updateById(user);

            // update in Elasticsearch
            MirrorOfLaw document = elasticsearchOperations.get(feedback.getId(), MirrorOfLaw.class);
            if (document == null) {
                log.warn("Feedback error: LawsData not found. Id: " + feedback.getId());
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.value(),
                        "LawsData not " + "found."), HttpStatus.NOT_FOUND);
            }
            switch (feedbackType) {
                case LIKE -> document.setLike(document.getLike() + 1);
                case DISLIKE -> document.setDislike(document.getDislike() + 1);
                case CANCEL_LIKE -> document.setLike(document.getLike() - 1);
                case CANCEL_DISLIKE -> document.setDislike(document.getDislike() - 1);
                case LIKE_TO_DISLIKE -> {
                    document.setLike(document.getLike() - 1);
                    document.setDislike(document.getDislike() + 1);
                }
                case DISLIKE_TO_LIKE -> {
                    document.setLike(document.getLike() + 1);
                    document.setDislike(document.getDislike() - 1);
                }
            }
            elasticsearchOperations.save(document);
            log.debug("Feedback success. Id: " + feedback.getId());
            return new ResponseEntity<>(new Response<>(true, feedbackType.ordinal(), 0, ""), HttpStatus.OK);

        } catch (Exception e) {
            log.error("Feedback error: " + e.getMessage());
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "相关内容推荐", description = "在搜索结果详情页中，根据当前内容推荐相关内容。")
    @Parameters({@Parameter(name = "id", description = "内容的id"), @Parameter(name = "type", description = "内容的类型"),
            @Parameter(name = "pageSize", description = "每页条数"), @Parameter(name = "pageNumber", description =
            "第x" + "页，从0开始")})
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "成功"), @ApiResponse(responseCode = "404",
            description = "内容不存在", content = @Content(schema = @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))})
    @GetMapping("/related")
    public ResponseEntity<Response<RelatedList>> related(@RequestParam(name = "id") String id, @RequestParam(name =
            "type") Integer type, @RequestParam(name = "pageSize", required = false, defaultValue = "10") Integer pageSize, @RequestParam(name = "pageNumber", required = false, defaultValue = "0") Integer pageNumber) {
        try {
            try {
                validatePageable(pageSize, pageNumber);
            } catch (IllegalArgumentException e) {
                log.warn("Get related list error: " + e.getMessage());
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.value(),
                        e.getMessage()), HttpStatus.BAD_REQUEST);
            }

            RelatedList relatedList = new RelatedList();
            relatedList.setLinks(new ArrayList<>());
            relatedList.setTotal(0);

            Pageable pageable = Pageable.ofSize(pageSize).withPage(pageNumber);
            MirrorOfLaw document = elasticsearchOperations.get(id, MirrorOfLaw.class);
            if (document == null) {
                log.warn("Get related list error: Document not found. Id: " + id);
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.value(),
                        "Document not " + "found."), HttpStatus.NOT_FOUND);
            }
            SearchHits<MirrorOfLaw> lawsData = elasticsearchOperations.search(SearchTemplateQuery.builder().withId(
                    "search_more_like_this").withParams(Map.of("id", id, "size", pageable.getPageSize(), "from",
                    pageable.getOffset())).build(), MirrorOfLaw.class);
            relatedList.setTotal((int) lawsData.getTotalHits());
            for (SearchHit<MirrorOfLaw> data : lawsData) {
                Related related = new Related();
                related.setId(data.getContent().getId());
                related.setType(data.getContent().getType());
                related.setTitle(data.getContent().getTitle());
                relatedList.getLinks().add(related);
            }
            log.debug("Get related list success. Total: " + lawsData.getTotalHits());
            return new ResponseEntity<>(new Response<>(true, relatedList, 0, ""), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Get related list error: " + e.getMessage());
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    public enum SearchType {
        ALL, TITLE, SOURCE
    }

    public enum ResultType {
        LAW, JUDGEMENT
    }

    public enum FeedbackType {
        LIKE, DISLIKE, CANCEL_LIKE, CANCEL_DISLIKE, LIKE_TO_DISLIKE, DISLIKE_TO_LIKE
    }

    @Data
    public static class Feedback {
        private String id;
        private Integer type;
        private Boolean feedback;
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

        // 裁判文书
        private String cause;
        private String caseId;
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
            private Float score;
        }
    }

    @Data
    public static class FeedbackCnt {
        private Integer likes;
        private Integer dislikes;
    }

    @Data
    public static class Related {
        private String id;
        private Integer type;
        private String title;
    }

    @Data
    public static class RelatedList {
        private List<Related> links;
        private Integer total;
    }
}
