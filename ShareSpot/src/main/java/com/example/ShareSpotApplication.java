package com.example;

import com.example.entity.User;
import com.example.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ShareSpotApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShareSpotApplication.class, args);
    }

    @Bean
    public CommandLineRunner seed(UserRepository userRepository) {
        return args -> {
            userRepository.findByUserId("parkmj0390").ifPresentOrElse(
                    u -> {
                        // 이미 있으면 아무 것도 안 함
                    },
                    () -> {
                        User u = new User("parkmj0390", "1234");
                        u.setNickname("김시흥");
                        u.setDong("시흥시 정왕동");
                        u.setIntro("");
                        u.setPhone("010-1234-5678");
                        u.setEmail("kimsiheung@example.com");
                        u.setSharedCount(8);
                        u.setThanksCount(15);
                        u.setTrustPercent(92);
                        u.setProfileInitial("김");

                        userRepository.save(u);
                    }
            );
        };
    }
}
