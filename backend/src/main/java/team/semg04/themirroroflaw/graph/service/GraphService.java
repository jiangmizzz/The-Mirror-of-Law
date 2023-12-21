package team.semg04.themirroroflaw.graph.service;

import com.baomidou.mybatisplus.extension.service.IService;
import team.semg04.themirroroflaw.graph.entity.Graph;

public interface GraphService extends IService<Graph> {
    Graph getByValue(String value);
}
