package com.ist.lms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, unique = true)
    private ERole name;

    // Getter for name
    public ERole getName() {
        return name;
    }

    // Builder method
    public static RoleBuilder builder() {
        return new RoleBuilder();
    }

    // Custom Builder class
    public static class RoleBuilder {
        private Role instance = new Role();
        
        public RoleBuilder id(Long id) {
            instance.id = id;
            return this;
        }
        
        public RoleBuilder name(ERole name) {
            instance.name = name;
            return this;
        }
        
        public Role build() {
            return instance;
        }
    }
} 