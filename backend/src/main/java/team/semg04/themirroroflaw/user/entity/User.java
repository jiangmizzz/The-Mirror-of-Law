package team.semg04.themirroroflaw.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.LinkedHashSet;
import java.util.List;

@Data
@Slf4j
@TableName("users")
public class User {
    @TableId(value = "id", type = IdType.AUTO)
    Long id;
    String username;
    String email;
    String password;
    byte[] history;
    byte[] feedbackLike;
    byte[] feedbackDislike;

    public LinkedHashSet<String> getHistoryAsSet() {
        try {
            return new ObjectMapper().readValue(new String(history), LinkedHashSet.class);
        } catch (Exception e) {
            log.error("User getHistory error: ", e);
            return null;
        }
    }

    public void setHistoryFromSet(LinkedHashSet<String> history) {
        try {
            this.history = new ObjectMapper().writeValueAsBytes(history);
        } catch (Exception e) {
            log.error("User setHistory error: ", e);
            this.history = null;
        }
    }

    public List<String> getLikeAsList() {
        try {
            return new ObjectMapper().readValue(new String(feedbackLike), List.class);
        } catch (Exception e) {
            log.error("User getHistory error: ", e);
            return null;
        }
    }

    public void setLikeFromList(List<String> feedbackLike) {
        try {
            this.feedbackLike = new ObjectMapper().writeValueAsBytes(feedbackLike);
        } catch (Exception e) {
            log.error("User setHistory error: ", e);
            this.feedbackLike = null;
        }
    }

    public List<String> getDislikeAsList() {
        try {
            return new ObjectMapper().readValue(new String(feedbackDislike), List.class);
        } catch (Exception e) {
            log.error("User getHistory error: ", e);
            return null;
        }
    }

    public void setDislikeFromList(List<String> feedbackDislike) {
        try {
            this.feedbackDislike = new ObjectMapper().writeValueAsBytes(feedbackDislike);
        } catch (Exception e) {
            log.error("User setHistory error: ", e);
            this.feedbackDislike = null;
        }
    }
}
