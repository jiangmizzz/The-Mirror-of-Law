package team.semg04.themirroroflaw.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import team.semg04.themirroroflaw.user.entity.User;

public interface UserService extends IService<User> {
    User getByUsername(String username);

    User getByEmail(String email);
}
