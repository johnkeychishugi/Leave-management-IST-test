package com.ist.lms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableJpaRepositories(basePackages = "com.ist.lms.repository")
@EntityScan(basePackages = "com.ist.lms.model")
public class LeaveManagementSystemApplication {

    public static void main(String[] args) {
        // Enable circular references (to handle potential circular dependencies)
        System.setProperty("spring.main.allow-circular-references", "true");
        SpringApplication.run(LeaveManagementSystemApplication.class, args);
    }
} 