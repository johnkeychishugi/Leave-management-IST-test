package com.ist.lms.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for the root endpoint that provides basic application information
 */
@RestController
public class HomeController {

    @Value("${spring.application.name:Leave Management System}")
    private String applicationName;
    
    @Value("${spring.profiles.active:default}")
    private String activeProfile;
    
    @Value("${server.servlet.context-path}")
    private String contextPath;

    /**
     * Returns basic information about the application at the root endpoint
     * @return Application information
     */
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> getAppInfo() {
        Map<String, Object> appInfo = new HashMap<>();
        appInfo.put("name", applicationName);
        appInfo.put("version", "1.0.0");
        appInfo.put("description", "Leave Management System for IST employees");
        appInfo.put("environment", activeProfile);
        appInfo.put("contextPath", contextPath);
        
        return ResponseEntity.ok(appInfo);
    }
} 