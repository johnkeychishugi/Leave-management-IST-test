package com.ist.lms.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    @Bean
    public OpenAPI openAPI() {
        Server devServer = new Server()
                .url("http://localhost:8080" + contextPath)
                .description("Development server");

        return new OpenAPI()
                .info(new Info()
                        .title("Leave Management System API")
                        .description("REST API for Leave Management System")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("IST Development Team")
                                .email("support@ist.com")
                                .url("https://ist.com"))
                        .license(new License()
                                .name("IST License")
                                .url("https://ist.com/licenses")))
                .servers(List.of(devServer))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", createJWTSecurityScheme()))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"));
    }

    private SecurityScheme createJWTSecurityScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Provide a JWT token. You can get a token by authenticating using /auth/login");
    }
} 