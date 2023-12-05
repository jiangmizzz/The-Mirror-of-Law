package team.semg04.themirroroflaw.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("users")
public class User {
    @TableId(value = "id", type = IdType.AUTO)
    Integer id;
    String username;
    String email;
    String password;
    String history;
    String setting;
    String feedback;
}
