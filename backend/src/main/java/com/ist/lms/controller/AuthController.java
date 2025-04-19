package com.ist.lms.controller;

import com.ist.lms.model.ERole;
import com.ist.lms.model.Role;
import com.ist.lms.model.User;
import com.ist.lms.payload.request.LoginRequest;
import com.ist.lms.payload.request.SignupRequest;
import com.ist.lms.payload.request.MicrosoftAuthRequest;
import com.ist.lms.repository.RoleRepository;
import com.ist.lms.repository.UserRepository;
import com.ist.lms.security.JwtTokenProvider;
import com.ist.lms.security.SecurityService;
import com.ist.lms.service.MicrosoftAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider tokenProvider;
    private final SecurityService securityService;
    private final MicrosoftAuthService microsoftAuthService;

    @Autowired
    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder encoder,
            JwtTokenProvider tokenProvider,
            SecurityService securityService,
            MicrosoftAuthService microsoftAuthService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.tokenProvider = tokenProvider;
        this.securityService = securityService;
        this.microsoftAuthService = microsoftAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.debug("Authentication attempt for user: {}", loginRequest.getEmail());
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));
            
            logger.debug("Authentication successful for user: {}", loginRequest.getEmail());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("type", "Bearer");
            
            // Add user details to the response
            userRepository.findByEmail(loginRequest.getEmail()).ifPresent(user -> {
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("firstName", user.getFirstName());
                response.put("lastName", user.getLastName());
                
                if (user.getRoles() != null) {
                    response.put("roles", user.getRoles().stream()
                            .map(role -> role.getName().name())
                            .toList());
                }
            });
            
            logger.debug("Login response prepared with token and user details");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Authentication failed for user: {}", loginRequest.getEmail(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        logger.debug("Registering user with email: {}", signUpRequest.getEmail());
        
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            logger.debug("Registration failed: Email {} is already in use", signUpRequest.getEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Email is already in use!");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Validate required fields
            if (signUpRequest.getFirstName() == null || signUpRequest.getFirstName().trim().isEmpty()) {
                throw new IllegalArgumentException("First name is required");
            }
            if (signUpRequest.getLastName() == null || signUpRequest.getLastName().trim().isEmpty()) {
                throw new IllegalArgumentException("Last name is required");
            }
            if (signUpRequest.getEmail() == null || signUpRequest.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email is required");
            }
            if (signUpRequest.getPassword() == null || signUpRequest.getPassword().trim().isEmpty()) {
                throw new IllegalArgumentException("Password is required");
            }

            // Create new user's account
            User user = new User();
            user.setFirstName(signUpRequest.getFirstName().trim());
            user.setLastName(signUpRequest.getLastName().trim());
            user.setEmail(signUpRequest.getEmail().trim());
            user.setPassword(encoder.encode(signUpRequest.getPassword()));
            user.setActive(true);
    
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_EMPLOYEE)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
            user.setRoles(roles);
            
            userRepository.save(user);
            
            logger.debug("User registered successfully: {}", signUpRequest.getEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully!");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error during registration", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error during registration: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get the current authenticated user
     * @return ResponseEntity containing the current user
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        logger.debug("Getting current user profile");
        
        return securityService.getCurrentUser()
                .map(user -> {
                    logger.debug("User found: {} (ID: {})", user.getEmail(), user.getId());
                    
                    // Ensure roles are initialized 
                    if (user.getRoles() != null) {
                        logger.debug("User has {} role(s)", user.getRoles().size());
                    } else {
                        logger.debug("User has no roles");
                    }
                    
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> {
                    logger.debug("No authenticated user found");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                });
    }
    
    /**
     * Debug endpoint to validate a token directly
     * @param token JWT token to validate (without 'Bearer ' prefix)
     * @return Information about the token
     */
    @GetMapping("/validate-token")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestParam String token) {
        logger.debug("Validating token directly: {}", token.substring(0, Math.min(10, token.length())));
        
        Map<String, Object> response = new HashMap<>();
        boolean isValid = tokenProvider.validateToken(token);
        response.put("valid", isValid);
        
        if (isValid) {
            String email = tokenProvider.getUsernameFromToken(token);
            response.put("email", email);
            
            userRepository.findByEmail(email).ifPresent(user -> {
                response.put("userId", user.getId());
                response.put("firstName", user.getFirstName());
                response.put("lastName", user.getLastName());
                
                if (user.getRoles() != null) {
                    response.put("roles", user.getRoles().stream()
                            .map(role -> role.getName().name())
                            .toList());
                }
            });
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Handle Microsoft authentication
     */
    @PostMapping("/microsoft")
    public ResponseEntity<Map<String, Object>> microsoftAuthentication(@Valid @RequestBody MicrosoftAuthRequest authRequest) {
        logger.debug("Microsoft authentication attempt for user: {}", authRequest.getEmail());
        
        try {
            // Process the user registration/login via Microsoft
            User user = microsoftAuthService.authenticateOrCreateUser(authRequest);
            
            // Generate JWT token
            String token = microsoftAuthService.generateTokenForUser(user);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("profilePictureUrl", user.getProfilePictureUrl());
            
            if (user.getRoles() != null) {
                response.put("roles", user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .toList());
            }
            
            logger.info("Microsoft authentication successful for user: {}", authRequest.getEmail());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Microsoft authentication failed for user: {}", authRequest.getEmail(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Authentication failed: " + e.getMessage());
            
            if (e instanceof IllegalArgumentException) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
} 