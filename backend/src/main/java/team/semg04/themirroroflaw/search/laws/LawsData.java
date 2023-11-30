package team.semg04.themirroroflaw.search.laws;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.util.Date;

@Data
@Document(indexName = "laws")
public class LawsData {
    @Id
    private String id;

    @Field(name = "title", type = FieldType.Text)
    private String title;
    @Field(name = "office", type = FieldType.Keyword)
    private String office;
    @Field(name = "publish", type = FieldType.Date)
    private Date publish;
    @Field(name = "expiry", type = FieldType.Date)
    private Date expiry;
    @Field(name = "type", type = FieldType.Byte)
    private Byte type;
    @Field(name = "status", type = FieldType.Byte)
    private Byte status;
    @Field(name = "content", type = FieldType.Text)
    private String content;
    @Field(name = "url", type = FieldType.Binary)
    private String url;
    @Field(name = "like", type = FieldType.Integer)
    private Integer like;
    @Field(name = "dislike", type = FieldType.Integer)
    private Integer dislike;
}
