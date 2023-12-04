package team.semg04.themirroroflaw.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import team.semg04.themirroroflaw.user.entity.User;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
