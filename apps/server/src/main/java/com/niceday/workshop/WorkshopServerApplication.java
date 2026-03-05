package com.niceday.workshop;

import com.niceday.workshop.auth.AuthProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AuthProperties.class)
public class WorkshopServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkshopServerApplication.class, args);
    }
}
