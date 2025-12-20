package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(f -> f.disable()))
            .authorizeHttpRequests(auth -> auth
                // ▼ 여기에 "/error"를 꼭 추가해야 합니다! ▼
                .requestMatchers("/", "/html/**", "/JS/**", "/Css/**", "/Images/**", "/Components/**", "/error").permitAll()
                .requestMatchers("/api/items/**", "/api/user/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(login -> login
                .loginPage("/html/login.html")
                .permitAll()
            );
        return http.build();
    }
}