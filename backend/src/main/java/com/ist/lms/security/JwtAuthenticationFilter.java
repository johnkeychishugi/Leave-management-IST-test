package com.ist.lms.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    // List of path patterns that should not be filtered
    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
            "/auth/**", 
            "/public/**",
            "/oauth2/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    );
    
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;
    
    @Autowired
    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, UserDetailsService userDetailsService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        logger.debug("Processing request: {} {}", request.getMethod(), path);
        
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt)) {
                logger.debug("JWT token found in request for path: {}", path);
                
                if (tokenProvider.validateToken(jwt)) {
                    // This actually returns the email (used as username in Spring Security)
                    String email = tokenProvider.getUsernameFromToken(jwt);
                    logger.debug("JWT token validated successfully for user: {}", email);

                    // Load user details using the email
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("Authentication set in SecurityContext for user: {} with authorities: {}", 
                            email, userDetails.getAuthorities());
                } else {
                    logger.warn("JWT token validation failed for path: {}", path);
                }
            } else {
                logger.debug("No JWT token found in request for path: {}", path);
                // Check if there's already an authentication in the context
                if (SecurityContextHolder.getContext().getAuthentication() != null) {
                    logger.debug("Authentication already exists in context: {}", 
                            SecurityContextHolder.getContext().getAuthentication());
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context for path: {}", path, ex);
        }

        filterChain.doFilter(request, response);
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        boolean shouldNotFilter = EXCLUDED_PATHS.stream()
                .anyMatch(p -> path.startsWith(p) || path.matches(p.replace("/**", "/.*")));
        
        if (shouldNotFilter) {
            logger.debug("Not filtering request: {} {}", request.getMethod(), path);
        }
        
        return shouldNotFilter;
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            logger.debug("Extracted JWT token: {}", maskToken(token));
            return token;
        }
        
        logger.debug("No Authorization header found or token is not Bearer token");
        return null;
    }
    
    /**
     * Masks the token for logging purposes - shows only the first and last 5 characters
     */
    private String maskToken(String token) {
        if (token == null) {
            return null;
        }
        
        if (token.length() <= 10) {
            return "*".repeat(token.length());
        }
        
        return token.substring(0, 5) + 
               "*".repeat(Math.max(0, token.length() - 10)) + 
               token.substring(token.length() - 5);
    }
} 