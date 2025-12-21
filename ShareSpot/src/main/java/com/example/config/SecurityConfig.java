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
                // 정적 리소스 + 에러 페이지 + 업로드 경로 허용
                .requestMatchers(
                    "/",
                    "/html/**",
                    "/JS/**",
                    "/Css/**",
                    "/Images/**",
                    "/Components/**",
                    "/uploads/**",
                    "/error"
                ).permitAll()
                .requestMatchers("/api/items/**", "/api/user/**", "/api/chat/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(login -> login
                .loginPage("/html/login.html")
                .permitAll()
            );

        return http.build();
    }
}
