package com.example.config; // 👈 1번 에러 해결: 폴더 위치와 맞춰야 함

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
        .csrf(csrf -> csrf.disable()) // 👈 반드시 비활성화되어 있는지 다시 확인!
        .headers(headers -> headers.frameOptions(f -> f.disable()))
        .authorizeHttpRequests(auth -> auth
            // 경로 허용 범위를 더 넓게 잡아 누락을 방지합니다.
            .requestMatchers("/", "/html/**", "/JS/**", "/Css/**", "/Images/**", "/Components/**").permitAll()
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