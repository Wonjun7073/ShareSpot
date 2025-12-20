package com.example.service;

import com.example.entity.User;
import com.example.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ✅ 로그인
    public boolean login(String userId, String password) {
        final String uid = (userId == null) ? null : userId.trim();
        final String pw = (password == null) ? null : password.trim();

        return userRepository.findByUserId(uid)
                .map(u -> Objects.equals(u.getPassword(), pw))
                .orElse(false);
    }

    // ✅ 회원가입 (userId, password, nickname)
    public void register(String userId, String password, String nickname) {
        userId = userId == null ? null : userId.trim();
        password = password == null ? null : password.trim();
        nickname = nickname == null ? "" : nickname.trim();

        if (userId == null || userId.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("아이디/비밀번호를 입력하세요.");
        }
        if (userRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        User u = new User(userId, password);
        u.setNickname(nickname);

        if (!nickname.isBlank()) {
            u.setProfileInitial(nickname.substring(0, 1));
        }

        userRepository.save(u);
    }

    // ✅ 현재 로그인 유저 조회
    public User getMe(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("사용자 데이터가 없습니다."));
    }

    // ✅ 현재 로그인 유저 수정
    public User updateMe(String userId, String nickname, String dong, String intro) {
        User me = getMe(userId);

        if (nickname != null && !nickname.isBlank()) {
            String nn = nickname.trim();
            me.setNickname(nn);
            me.setProfileInitial(nn.substring(0, 1));
        }
        if (dong != null && !dong.isBlank()) {
            me.setDong(dong.trim());
        }
        if (intro != null) {
            me.setIntro(intro);
        }

        return userRepository.save(me);
    }
}
