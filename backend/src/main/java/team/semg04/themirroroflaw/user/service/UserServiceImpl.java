package team.semg04.themirroroflaw.user.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import team.semg04.themirroroflaw.user.entity.User;
import team.semg04.themirroroflaw.user.mapper.UserMapper;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    public User getByUsername(String username) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        return getOne(queryWrapper);
    }

    public User getByEmail(String email) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        return getOne(queryWrapper);
    }
}
