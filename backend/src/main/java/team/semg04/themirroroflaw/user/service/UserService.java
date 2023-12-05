package team.semg04.themirroroflaw.user.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import team.semg04.themirroroflaw.user.entity.User;
import team.semg04.themirroroflaw.user.mapper.UserMapper;

@Service
public class UserService {
    private UserMapper userMapper;

    @Autowired
    public void setUserMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }
    public User selectUser(Integer id) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.select("id", "username", "email", "history")
                    .eq("id", id);
        return userMapper.selectOne(queryWrapper);
    }

}
