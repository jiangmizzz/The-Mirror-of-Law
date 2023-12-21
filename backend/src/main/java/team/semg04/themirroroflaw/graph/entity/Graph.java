package team.semg04.themirroroflaw.graph.entity;

import com.alibaba.fastjson.JSONArray;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Data
@Slf4j
@AllArgsConstructor
@TableName("graphs")
public class Graph {
    @TableId(value = "id", type = IdType.AUTO)
    Long id;
    String value;
    String description;
    byte[] neighbors;

    public List<Long> getNeighborsAsList() {
        try {
            List list = new ObjectMapper().readValue(new String(neighbors), List.class);
            return JSONArray.parseArray(list.toString(), Long.class);
        } catch (Exception e) {
            log.error("Graph node getNeighbors error: ", e);
            return null;
        }
    }

    public void setNeighborsFromList(List<Long> neighbors) {
        try {
            this.neighbors = new ObjectMapper().writeValueAsString(neighbors).getBytes();
        } catch (Exception e) {
            log.error("Graph node setNeighbors error: ", e);
            this.neighbors = null;
        }
    }
}