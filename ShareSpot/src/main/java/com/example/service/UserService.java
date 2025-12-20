package com.example.service;

import com.example.entity.User;
import com.example.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 🔍 로그인 (디버깅용)
    public boolean login(String userId, String password) {
        final String uid = (userId == null) ? null : userId.trim();
        final String pw = (password == null) ? null : password.trim();

        System.out.println("[LOGIN] input userId='" + uid + "', password='" + pw + "'");

        return userRepository.findByUserId(uid)
                .map(u -> {
                    System.out.println("[LOGIN] FOUND userId='" + u.getUserId() + "'");
                    System.out.println("[LOGIN] DB password='" + u.getPassword() + "'");
                    return Objects.equals(u.getPassword(), pw);
                })
                .orElseGet(() -> {
                    System.out.println("[LOGIN] NOT FOUND userId='" + uid + "'");
                    return false;
                });
    }

    // 🔍 회원가입 (디버깅용)
    public void register(String userId, String password) {
        userId = userId == null ? null : userId.trim();
        password = password == null ? null : password.trim();

        System.out.println("[REGISTER] input userId='" + userId + "', password='" + password + "'");

        if (userId == null || userId.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("아이디/비밀번호를 입력하세요.");
        }
        if (userRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        User saved = userRepository.save(new User(userId, password));
        System.out.println("[REGISTER] SAVED id=" + saved.getId() + ", userId='" + saved.getUserId() + "'");
    }

    // ✅ 아래는 그대로 유지 (절대 수정 X)
    private static final String CURRENT_USER_ID = "parkmj0390";

    public User getMe() {
        return userRepository.findByUserId(CURRENT_USER_ID)
                .orElseThrow(() -> new IllegalStateException("임시 사용자 데이터가 없습니다."));
    }

    public User updateMe(String nickname, String dong, String intro) {
        User me = getMe();

        if (nickname != null && !nickname.isBlank()) {
            me.setNickname(nickname.trim());
            me.setProfileInitial(nickname.substring(0, 1));
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