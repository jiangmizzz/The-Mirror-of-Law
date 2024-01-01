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
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.SearchTemplateQuery;
import org.springframework.data.elasticsearch.core.script.Script;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import team.semg04.themirroroflaw.Response;
import team.semg04.themirroroflaw.search.entity.MirrorOfLaw;
import team.semg04.themirroroflaw.user.entity.User;
import team.semg04.themirroroflaw.user.service.UserService;
import team.semg04.themirroroflaw.user.utils.RememberMeService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static java.lang.System.exit;
import static team.semg04.themirroroflaw.user.UserController.getCurrentUser;

@Slf4j
@RestController
@RequestMapping("/api/personal")
@Tag(name = "Personal", description = "个性化相关内容")
public class PersonalController {
    private UserService userService;

    private RememberMeService rememberMeService;
    private ElasticsearchOperations elasticsearchOperations;

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
        Script randomScript = Script.builder().withId("random_get").withLanguage("mustache").withSource("""
                {
                  "_source": {
                    "includes": ["id","type","title"]
                  },
                  "sort": {
                    "_script": {
                      "type": "number",
                      "script": "Math.random()",
                      "order": "asc"
                    }
                  },
                  "size": {{{size}}},
                  "from": 0
                }
                """).build();
        Script relatedScript =
                Script.builder().withId("relate_get").withLanguage("mustache").withSource("""
                        {
                          "_source": {
                            "includes": ["id","type","title"]
                          },
                          "query": {
                            "bool": {
                              "must": {
                                "multi_match": {
                                  "query": "{{{input}}}",
                                    "fields": ["content", "title^3"],
                                    "analyzer": "ik_smart"
                                  }
                              },
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
                          "sort": {
                            "_script": {
                              "type": "number",
                              "script": "Math.random()",
                              "order": "asc"
                            }
                          },
                          "size": {{{size}}},
                          "from": {{{from}}}
                        }
                        """).build();
        try {
            elasticsearchOperations.deleteScript("random_get");
            elasticsearchOperations.deleteScript("relate_get");
            log.debug("Delete script success.");
        } catch (Exception e) {
            log.error("Delete script error: " + e.getMessage());
        }
        try {
            elasticsearchOperations.putScript(randomScript);
            elasticsearchOperations.putScript(relatedScript);
            log.debug("Put script success.");
        } catch (Exception e) {
            log.error("Put script error: " + e.getMessage());
            exit(-1);
        }
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
    public ResponseEntity<Response<List<String>>> history(@RequestParam(required = false, defaultValue = "10") Integer reqNumber, HttpServletRequest request
            , HttpServletResponse response) {
        try {
            User user;
            try {
                user = getCurrentUser(request, response, userService, rememberMeService);
            } catch (Exception e) {
                log.warn("Get personal history error: User not found." + e.getMessage());
                return new ResponseEntity<>(new Response<>(false, null, 1, "Not logged in yet!"),
                        HttpStatus.UNAUTHORIZED);
            }
            List<String> history = new ArrayList<>(user.getHistoryAsSet());
            Collections.reverse(history);
            log.debug("Get personal history: " + history);
            return new ResponseEntity<>(new Response<>(true, history.subList(0, Math.min(history.size(), reqNumber))
                    , 0, "Success."), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Get personal history error: ", e);
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "个性化推荐内容", description = "⽤⼾在⾸⻚搜索框下⽅可以看到若⼲条推送内容：如果是已登录⽤⼾，这些推送内容将与其搜索历史相关；如果未登录，则随机推送。")
    @Parameter(name = "reqNumber", description = "请求的推荐内容数量")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "500", description = "服务器内部错误", content = @Content(schema =
            @Schema(implementation = Response.class)))
    })
    @GetMapping("/recommends")
    public ResponseEntity<Response<List<Recommend>>> recommends(@RequestParam(required = false, defaultValue = "10", name = "reqNumber") Integer reqNumber,
                                                                HttpServletRequest request,
                                                                HttpServletResponse response) {
        try {
            if (reqNumber <= 0 || reqNumber > 50) {
                log.warn("Get personal recommends error: Invalid request number.");
                return new ResponseEntity<>(new Response<>(false, null, 1, "Invalid request number, should be in [1, " +
                        "50]."),
                        HttpStatus.BAD_REQUEST);
            }

            User user = null;
            try {
                user = getCurrentUser(request, response, userService, rememberMeService);
            } catch (Exception ignored) {
            }
            if (user == null || user.getHistoryAsSet().isEmpty()) {
                // return random recommends
                log.debug("Get personal recommends: User not logged in.");
                SearchHits<MirrorOfLaw> searchResult =
                        elasticsearchOperations.search(SearchTemplateQuery.builder().withId("random_get")
                                .withParams(Map.of("size", reqNumber)).build(), MirrorOfLaw.class);
                List<Recommend> recommends = new ArrayList<>();
                for (var hit : searchResult) {
                    recommends.add(new Recommend(hit.getContent().getId(), hit.getContent().getType(),
                            hit.getContent().getTitle()));
                }
                log.debug("Get personal recommends success.");
                return new ResponseEntity<>(new Response<>(true, recommends, 0, "Success."), HttpStatus.OK);
            }

            // return recommends related to user's history
            List<String> history = new ArrayList<>(user.getHistoryAsSet());
            Collections.shuffle(history);
            List<Recommend> recommends = new ArrayList<>();
            int historySearchNum, historySearchSize, historySearchFrom;
            if (history.size() <= (reqNumber + 1) / 2) {
                // 历史记录较少，对每条历史记录搜索指定量的相关内容
                historySearchNum = history.size();
                historySearchSize = reqNumber / history.size() + 1;
                historySearchFrom = 10 / historySearchSize; // 至少前面有10条
            } else {
                historySearchNum = (reqNumber + 1) / 2;
                historySearchSize = 2;
                historySearchFrom = 5;
            }
            for (int i = 0; i < historySearchNum; i++) {
                SearchHits<MirrorOfLaw> searchResult =
                        elasticsearchOperations.search(SearchTemplateQuery.builder().withId("relate_get")
                                .withParams(Map.of("input", history.get(i), "size", historySearchSize, "from",
                                        historySearchFrom)).build(), MirrorOfLaw.class);
                for (var hit : searchResult) {
                    recommends.add(new Recommend(hit.getContent().getId(), hit.getContent().getType(),
                            hit.getContent().getTitle()));
                }
            }
            log.debug("Get personal recommends success.");
            return new ResponseEntity<>(new Response<>(true, recommends, 0, "Success."), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Get personal recommends error: ", e);
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Data
    @AllArgsConstructor
    public static class Recommend {
        private String id;
        private Integer type;
        private String title;
    }
}
