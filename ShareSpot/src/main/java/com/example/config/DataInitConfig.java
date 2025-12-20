package com.example.config;

import com.example.entity.User;
import com.example.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitConfig {

    @Bean
    CommandLineRunner initData(UserRepository userRepository) {
        return args -> {
            // 데이터베이스에 유저가 하나도 없을 때만 실행
            if (userRepository.count() == 0) {
                // 테스트용 유저 생성 (아이디: testUser, 비밀번호: 1234)
                // 만약 User 엔티티의 생성자가 다르다면 본인의 엔티티에 맞춰 수정하세요.
                userRepository.save(new User("testUser", "1234"));
                System.out.println(">>> 데이터베이스가 비어있어 테스트 유저(testUser)를 생성했습니다.");
            } else {
                System.out.println(">>> 이미 데이터가 존재하여 초기화 로그를 건너뜁니다.");
            }
        };
    }
}