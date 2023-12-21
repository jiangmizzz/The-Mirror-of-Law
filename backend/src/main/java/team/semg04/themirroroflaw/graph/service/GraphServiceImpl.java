package team.semg04.themirroroflaw.graph.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import team.semg04.themirroroflaw.graph.entity.Graph;
import team.semg04.themirroroflaw.graph.mapper.GraphMapper;

@Service
public class GraphServiceImpl extends ServiceImpl<GraphMapper, Graph> implements GraphService {
    public Graph getByValue(String value) {
        QueryWrapper<Graph> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("value", value);
        return getOne(queryWrapper);
    }
}
