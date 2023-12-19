plugins {
    java
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.3"
}

group = "team.SEMG04"
version = "0.0.1"

java {
    sourceCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.data:spring-data-elasticsearch")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.2.0")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
    implementation("com.baomidou:mybatis-plus-boot-starter:3.5.3.1") {
        exclude(group = "org.mybatis", module = "mybatis-spring")
    }
    implementation("org.mybatis:mybatis-spring:3.0.3")
    implementation("com.kennycason:kumo-core:1.28")
    implementation("com.kennycason:kumo-tokenizers:1.28")
    implementation("com.alibaba:fastjson:1.2.67")
    implementation("com.google.code.gson:gson:2.8.5")
    implementation("com.squareup.okhttp3:okhttp:4.10.0")
    implementation("com.squareup.okio:okio:2.10.0")
    runtimeOnly("com.alibaba:druid-spring-boot-starter:1.2.16")
    runtimeOnly("com.mysql:mysql-connector-j")
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.bootBuildImage {
    builder.set("paketobuildpacks/builder-jammy-base:latest")
}
