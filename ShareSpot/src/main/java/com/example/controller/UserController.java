package com.example.controller;

import com.example.dto.LoginRequest;
import com.example.service.UserService;

import jakarta.servlet.http.HttpSession;

import com.example.dto.MeResponse;
import com.example.dto.RegisterRequest;
import com.example.dto.UpdateProfileRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest req, HttpSession session) {
        Map<String, Object> res = new HashMap<>();

        boolean success = userService.login(req.getUserId(), req.getPassword());

        if (success) {
            session.setAttribute("LOGIN_USER_ID", req.getUserId().trim()); // ✅ 저장
            res.put("success", true);
            res.put("message", "로그인 성공");
        } else {
            res.put("success", false);
            res.put("message", "아이디 또는 비밀번호가 잘못되었습니다.");
        }
        return res;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest req) {
        Map<String, Object> res = new HashMap<>();
        try {
            userService.register(req.getUserId(), req.getPassword(), req.getNickname());
            res.put("success", true);
            res.put("message", "회원가입 성공");
        } catch (IllegalArgumentException e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "서버 오류");
        }
        return res;
    }

    @GetMapping("/me")
    public MeResponse me(HttpSession session) {
        String loginUserId = (String) session.getAttribute("LOGIN_USER_ID");
        if (loginUserId == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return MeResponse.from(userService.getMe(loginUserId));
    }

    @PutMapping("/me")
    public MeResponse updateMe(@RequestBody UpdateProfileRequest req, HttpSession session) {
        String loginUserId = (String) session.getAttribute("LOGIN_USER_ID");
        if (loginUserId == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return MeResponse.from(
                userService.updateMe(loginUserId, req.getNickname(), req.getDong(), req.getIntro()));
    }

}
