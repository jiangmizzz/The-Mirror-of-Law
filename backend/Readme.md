# The-Mirror-of-Law Backend

2023ZJU软件工程管理课程-G04小组项目代码仓库-后端

## 运行方式

### 编写配置文件

在目录`src/main/resources`下新建`application.properties`文件，内容参考`application_template.properties`，仅需修改`EDIT ME`中的信息即可。

其中，`spring.elasticsearch.uris`为Elasticsearch服务器地址，`spring.elasticsearch.username`和`spring.elasticsearch.password`为Elasticsearch服务器的用户名和密码。
```properties
#-----EDIT ME-----#
spring.elasticsearch.uris=127.0.0.1
spring.elasticsearch.username=<username>
spring.elasticsearch.password=<password>
#------------------#

logging.level.root=INFO
logging.file.name=logs/TheMirrorOfLaw.log
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.default-consumes-media-type=application/json
springdoc.default-produces-media-type=application/json
#-----FOR DEBUGGING-----#
#logging.level.tracer=TRACE
#-----------------------#
```

### 编译运行

项目使用`Gradle`进行构建，请自行参考`Gradle`的使用方法。或使用`IntelliJ IDEA`打开项目，使用`IDEA`自带的`Gradle`插件进行构建。

## 接口文档

默认配置下，接口文档地址为：

- swagger-ui：[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- api-docs：[http://localhost:8080/api-docs](http://localhost:8080/api-docs)