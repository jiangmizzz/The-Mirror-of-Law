package team.semg04.themirroroflaw.graph;

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
import team.semg04.themirroroflaw.graph.entity.Graph;
import team.semg04.themirroroflaw.graph.service.GraphService;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/graph")
@Tag(name = "Graph", description = "知识图谱")
public class GraphController {
    private final GraphService graphService;

    @Autowired
    public GraphController(GraphService graphService) {
        this.graphService = graphService;
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
                try {
                    graphService.getById(neighbor);
                } catch (Exception e) {
                    log.warn("Graph node add error: ", e);
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

    @Operation(summary = "获取知识图谱结构", description = "⽤⼾每次进⾏搜索，或者点击切换知识图谱中的中⼼节点，都需要获取新的知识图谱结构，以\n" +
            "渲染出新的知识图谱。其中，若为每次搜索后⾃动产⽣的知识图谱，则其中⼼词由输⼊内容分析得出。")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功"),
            @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    @GetMapping("/get")
    public ResponseEntity<Response<ResponseGraph>> get(@RequestParam String input, @RequestParam Integer depth) {
        try {
            Graph graph = graphService.getByValue(input);
            if (graph == null) {
                return new ResponseEntity<>(new Response<>(false, null, HttpStatus.NOT_FOUND.value(), "Center not " +
                        "found."), HttpStatus.NOT_FOUND);
            }

            ResponseNodeInfo center = new ResponseNodeInfo(graph.getId(), graph.getValue(), null);
            ResponseGraph responseGraph = new ResponseGraph(center, graph.getDescription());
            Set<Long> visited = new HashSet<>();

            // BFS
            Queue<ResponseNodeInfo> curQueue = new LinkedList<>();
            Queue<ResponseNodeInfo> nextQueue = new LinkedList<>();
            curQueue.add(center);
            visited.add(center.getId());
            for (int i = 0; i < depth; i++) {
                while (!curQueue.isEmpty()) {
                    ResponseNodeInfo curNode = curQueue.poll();

                    List<Long> neighbors = graphService.getById(curNode.getId()).getNeighborsAsList();
                    List<ResponseNodeInfo> children = new ArrayList<>();
                    for (Long neighbor : neighbors) {
                        if (!visited.contains(neighbor)) {
                            visited.add(neighbor);
                            Graph neighborNode = graphService.getById(neighbor);
                            ResponseNodeInfo child = new ResponseNodeInfo(neighborNode.getId(),
                                    neighborNode.getValue(), null);
                            children.add(child);
                            nextQueue.add(child);
                        }
                    }
                    curNode.setChildren(children);
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
        Long id;
        String value;
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
        Long id;
        String value;
        String description;
        List<Long> neighbors;
    }
}
