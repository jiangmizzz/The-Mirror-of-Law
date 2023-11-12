package team.semg04.themirroroflaw;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication
public class TheMirrorOfLawApplication {

    public static void main(String[] args) {
        try {
            SpringApplication.run(TheMirrorOfLawApplication.class, args);
        } catch (Exception e) {
            log.error("Error: " + e.getMessage());
        }
    }

}
