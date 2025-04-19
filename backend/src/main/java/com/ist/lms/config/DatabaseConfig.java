package com.ist.lms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Configuration
public class DatabaseConfig {

    @Autowired
    private DataSource dataSource;

    /**
     * Initialize the database if it doesn't exist
     */
    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                // Check database connection
                if (connection.isValid(5)) {
                    System.out.println("Database connection is valid!");
                } else {
                    System.err.println("Database connection is invalid!");
                }
            } catch (SQLException e) {
                System.err.println("Error connecting to database: " + e.getMessage());
                // Try to create the database
                createDatabaseIfNotExists();
            }
        };
    }

    /**
     * Create the database if it doesn't exist
     */
    private void createDatabaseIfNotExists() {
        try (Connection connection = dataSource.getConnection()) {
            Statement statement = connection.createStatement();
            
            // Attempt to create the database
            // (This will fail gracefully if the database already exists)
            statement.execute("CREATE DATABASE IF NOT EXISTS leave_management");
            
            System.out.println("Database created or already exists");
        } catch (SQLException e) {
            System.err.println("Failed to create database: " + e.getMessage());
        }
    }
} 