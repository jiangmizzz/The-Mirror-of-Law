package team.semg04.themirroroflaw.search.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.LocalDate;

@Data
@Document(indexName = "mirror-of-law")
public class MirrorOfLaw {
    @Id
    private String id;

    @Field(name = "title", type = FieldType.Text)
    private String title;
    @Field(name = "level", type = FieldType.Text)
    private String level;
    @Field(name = "source", type = FieldType.Text)
    private String source;
    @Field(name = "date", type = FieldType.Date)
    private LocalDate date;
    @Field(name = "content", type = FieldType.Text)
    private String content;
    @Field(name = "type", type = FieldType.Integer)
    private Integer type;
    @Field(name = "url", type = FieldType.Binary)
    private String url;
    @Field(name = "like", type = FieldType.Integer)
    private Integer like;
    @Field(name = "dislike", type = FieldType.Integer)
    private Integer dislike;

    // 裁判文书
    @Field(name = "cause", type = FieldType.Text)
    private String cause;
    @Field(name = "caseId", type = FieldType.Keyword)
    private String caseId;
}
