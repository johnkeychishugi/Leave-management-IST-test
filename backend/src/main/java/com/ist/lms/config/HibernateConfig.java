package com.ist.lms.config;

import org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class HibernateConfig {
    
    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer() {
        return hibernateProperties -> {
            hibernateProperties.put("hibernate.physical_naming_strategy", 
                    CamelCaseToUnderscoresNamingStrategy.class.getName());
            hibernateProperties.put("hibernate.implicit_naming_strategy", 
                    CamelCaseToUnderscoresNamingStrategy.class.getName());
        };
    }
} 