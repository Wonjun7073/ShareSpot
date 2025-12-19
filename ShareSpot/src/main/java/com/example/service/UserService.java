package com.example.service;

import com.example.entity.User;
import com.example.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 로그인: 아이디로 조회 후 비번 비교
    public boolean login(String userId, String password) {
        return userRepository.findByUserId(userId)
                .map(u -> u.getPassword().equals(password))
                .orElse(false);
    }

    // 회원가입: 중복 체크 후 저장
    public void register(String userId, String password) {
        if (userRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        userRepository.save(new User(userId, password));
    }
}
