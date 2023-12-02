package team.semg04.themirroroflaw;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Response<T> {
    private Boolean success;
    private T data;
    private String errorCode;
    private String errorMessage;
}
