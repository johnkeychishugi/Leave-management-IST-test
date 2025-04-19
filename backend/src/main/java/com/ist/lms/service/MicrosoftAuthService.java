package com.ist.lms.service;

import com.ist.lms.model.ERole;
import com.ist.lms.model.Role;
import com.ist.lms.model.User;
import com.ist.lms.payload.request.MicrosoftAuthRequest;
import com.ist.lms.repository.RoleRepository;
import com.ist.lms.repository.UserRepository;
import com.ist.lms.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MicrosoftAuthService {

    private static final Logger logger = LoggerFactory.getLogger(MicrosoftAuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;
    private final Environment environment;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.allowed-domains:ist.com}")
    private String allowedDomains;
    
    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @Autowired
    public MicrosoftAuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            JwtTokenProvider tokenProvider,
            UserDetailsService userDetailsService,
            Environment environment,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
        this.environment = environment;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User authenticateOrCreateUser(MicrosoftAuthRequest authRequest) {
        logger.debug("Authenticating Microsoft user: {}", authRequest.getEmail());
        
        // Check if domain is allowed only in production environment
        boolean isProduction = isProductionEnvironment();
        if (isProduction) {
            String emailDomain = authRequest.getEmail().substring(authRequest.getEmail().indexOf('@') + 1);
            if (!isAllowedDomain(emailDomain)) {
                logger.warn("Domain not allowed in production: {}", emailDomain);
                throw new IllegalArgumentException("Only @ist.com email addresses are allowed in production environment");
            }
        }

        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(authRequest.getEmail());
        
        if (existingUser.isPresent()) {
            // Update existing user
            User user = existingUser.get();
            user.setProfilePictureUrl(authRequest.getProfilePictureUrl());
            
            // If user doesn't have a microsoftId, set it now
            if (user.getMicrosoftId() == null) {
                user.setMicrosoftId(authRequest.getEmail());
            }
            
            // Make sure the user has a password set (for Spring Security)
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                // Generate a secure random password
                user.setPassword(passwordEncoder.encode(generateSecurePassword()));
            }
            
            logger.info("Updated existing user: {}", user.getEmail());
            return userRepository.save(user);
        } else {
            // Create new user
            User newUser = new User();
            newUser.setFirstName(authRequest.getFirstName());
            newUser.setLastName(authRequest.getLastName());
            newUser.setEmail(authRequest.getEmail());
            newUser.setProfilePictureUrl(authRequest.getProfilePictureUrl());
            newUser.setMicrosoftId(authRequest.getEmail());
            newUser.setActive(true);
            
            // Set a secure random password (required by Spring Security)
            newUser.setPassword(passwordEncoder.encode(generateSecurePassword()));
            
            // Assign default role
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_EMPLOYEE)
                    .orElseThrow(() -> new RuntimeException("Error: Default role not found."));
            roles.add(userRole);
            newUser.setRoles(roles);
            
            logger.info("Created new user: {}", newUser.getEmail());
            return userRepository.save(newUser);
        }
    }

    /**
     * Generate a secure random password for users authenticated via Microsoft
     * @return A secure random string
     */
    private String generateSecurePassword() {
        // Generate a UUID-based random password
        // This is never exposed to the user since they authenticate via Microsoft
        return UUID.randomUUID().toString();
    }

    private boolean isProductionEnvironment() {
        // Check if we're running in production mode based on active profiles or environment variables
        String[] activeProfiles = environment.getActiveProfiles();
        
        // Check if "prod" or "production" is among active profiles
        for (String profile : activeProfiles) {
            if (profile.equalsIgnoreCase("prod") || profile.equalsIgnoreCase("production")) {
                return true;
            }
        }
        
        // Check if SPRING_PROFILES_ACTIVE environment variable is set to production
        if (activeProfile != null && 
            (activeProfile.equalsIgnoreCase("prod") || activeProfile.equalsIgnoreCase("production"))) {
            return true;
        }
        
        // Check for common production environment indicators
        String envVar = System.getenv("NODE_ENV");
        if (envVar != null && envVar.equalsIgnoreCase("production")) {
            return true;
        }
        
        return false;
    }

    private boolean isAllowedDomain(String domain) {
        if (allowedDomains == null || allowedDomains.trim().isEmpty()) {
            return true; // No restrictions if no domains are specified
        }
        
        String[] domains = allowedDomains.split(",");
        for (String allowedDomain : domains) {
            if (allowedDomain.trim().equalsIgnoreCase(domain)) {
                return true;
            }
        }
        return false;
    }

    public String generateTokenForUser(User user) {
        try {
            // Load user details from user details service
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            
            // Create authentication object
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            
            // Set authentication in context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Generate token
            return tokenProvider.generateToken(authentication);
        } catch (Exception e) {
            logger.error("Error generating token for user: {}", user.getEmail(), e);
            throw e;
        }
    }
} 