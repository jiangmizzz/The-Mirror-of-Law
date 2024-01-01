package team.semg04.themirroroflaw.graph;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.semg04.themirroroflaw.Response;
import team.semg04.themirroroflaw.ai.SparkModelConnector;
import team.semg04.themirroroflaw.graph.entity.Graph;
import team.semg04.themirroroflaw.graph.service.GraphService;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/graph")
@Tag(name = "Graph", description = "知识图谱")
public class GraphController {
    private static final String findNodePrompt =
            "请你根据我所给出的文字内容，判断下面列表中哪个关键词最为相关，并仅以关联度最大的一个关键词作为你的回答，不要掺杂其他的文字。关键词列表如下：\n";
    private final GraphService graphService;
    private List<String> graphNodeValues;

    @Autowired
    public GraphController(GraphService graphService) {
        this.graphService = graphService;
//        init();
    }

    private void init() {
        List<Graph> graphNodes = graphService.list();
        graphNodeValues = new ArrayList<>();
        for (Graph graphNode : graphNodes) {
            graphNodeValues.add(graphNode.getValue());
        }
    }

    @Operation(summary = "新增节点", description = "新增节点。")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "成功"),
            @ApiResponse(responseCode = "400", description = "邻居不存在"),
            @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    @PostMapping("/add")
    public ResponseEntity<Response<Void>> add(@RequestBody GraphNodeInfo graphNode) {
        try {
            // check if all neighbors exist
            for (Long neighbor : graphNode.getNeighbors()) {
                Graph graph = graphService.getById(neighbor);
                if (graph == null) {
                    return new ResponseEntity<>(new Response<>(false, null, HttpStatus.BAD_REQUEST.value(),
                            "Neighbor not found."), HttpStatus.BAD_REQUEST);
                }
            }

            // save current node
            Graph graph = new Graph(0L, graphNode.getValue(), graphNode.getDescription(), null);
            graph.setNeighborsFromList(graphNode.getNeighbors());
            graphService.save(graph);

            // save neighbors
            for (Long neighbor : graphNode.getNeighbors()) {
                Graph neighborNode = graphService.getById(neighbor);
                List<Long> neighborNeighbors = neighborNode.getNeighborsAsList();
                neighborNeighbors.add(graph.getId());
                neighborNode.setNeighborsFromList(neighborNeighbors);
                graphService.updateById(neighborNode);
            }

            log.debug("Graph node added: {}", graphNode);
            return new ResponseEntity<>(new Response<>(true, null, 0, ""), HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Graph node add error: ", e);
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String findNode(String content) {
        String defaultNode = "法律";
        String result;
        try {
            if (content.length() >= 2048) {
                return defaultNode;
            }
            result =
                    SparkModelConnector.getAnswer(findNodePrompt + graphNodeValues.toString() + "\n我输入的文字内容如下：\n" + content);
            log.debug("Graph node find: {}", result);
            if (result.isEmpty()) {
                return defaultNode;
            }
            return result;
        } catch (Exception e) {
            log.error("Graph node find error: ", e);
            return defaultNode;
        }
    }

    @Operation(summary = "获取知识图谱结构", description = "⽤⼾每次进⾏搜索，或者点击切换知识图谱中的中⼼节点，都需要获取新的知识图谱结构，以\n" +
            "渲染出新的知识图谱。其中，若为每次搜索后⾃动产⽣的知识图谱，则其中⼼词由输⼊内容分析得出。")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    @GetMapping("/get")
    public ResponseEntity<Response<ResponseGraph>> get(@RequestParam String input, @RequestParam Integer depth) {
        try {
//            Graph graph = graphService.getByValue(findNode(input));

            QueryWrapper<Graph> queryWrapper = new QueryWrapper<>();
            queryWrapper.like("value", input);
            queryWrapper.last("limit 1");
            Graph graph = graphService.getOne(queryWrapper);
            if (graph == null) {
                log.warn("Graph not found: {}", input);
                graph = graphService.getByValue("法律");
            }

            ResponseNodeInfo center = new ResponseNodeInfo(graph.getId().toString(), graph.getValue(), null);
            ResponseGraph responseGraph = new ResponseGraph(center, graph.getDescription());
            Set<Long> visited = new HashSet<>();

            // BFS
            Queue<ResponseNodeInfo> curQueue = new LinkedList<>();
            Queue<ResponseNodeInfo> nextQueue = new LinkedList<>();
            curQueue.add(center);
            visited.add(graph.getId());
            for (int i = 0; i < depth && !curQueue.isEmpty(); i++) {
                while (!curQueue.isEmpty()) {
                    ResponseNodeInfo curNode = curQueue.poll();

                    List<Long> neighbors = graphService.getById(curNode.getId()).getNeighborsAsList();
                    List<ResponseNodeInfo> children = new ArrayList<>();
                    for (Long neighbor : neighbors) {
                        if (!visited.contains(neighbor)) {
                            visited.add(neighbor);
                            Graph neighborNode = graphService.getById(neighbor);
                            ResponseNodeInfo child = new ResponseNodeInfo(neighborNode.getId().toString(),
                                    neighborNode.getValue(), null);
                            children.add(child);
                            nextQueue.add(child);
                        }
                    }
                    if (!children.isEmpty()) {
                        curNode.setChildren(children);
                    }
                }
                curQueue = nextQueue;
                nextQueue = new LinkedList<>();
            }

            log.debug("Graph get: {}", responseGraph);
            return new ResponseEntity<>(new Response<>(true, responseGraph, 0, ""), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Graph node get error: ", e);
            return new ResponseEntity<>(new Response<>(false, null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Data
    @AllArgsConstructor
    public static class ResponseNodeInfo {
        String id;
        String value;
        @JsonInclude(JsonInclude.Include.NON_NULL)
        List<ResponseNodeInfo> children;
    }

    @Data
    @AllArgsConstructor
    public static class ResponseGraph {
        ResponseNodeInfo center;
        String desc;
    }

    @Data
    public static class GraphNodeInfo {
        String value;
        String description;
        List<Long> neighbors;
    }
}
