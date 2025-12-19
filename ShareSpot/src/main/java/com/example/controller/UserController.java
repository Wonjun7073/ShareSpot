package com.example.controller;

import com.example.dto.LoginRequest;
import com.example.service.UserService;
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
    public Map<String, Object> login(@RequestBody LoginRequest req) {
        Map<String, Object> res = new HashMap<>();

        boolean success = userService.login(req.getId(), req.getPw());

        if (success) {
            res.put("success", true);
            res.put("message", "로그인 성공");
        } else {
            res.put("success", false);
            res.put("message", "아이디 또는 비밀번호가 잘못되었습니다.");
        }
        return res;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody LoginRequest req) {
        Map<String, Object> res = new HashMap<>();
        try {
            userService.register(req.getId(), req.getPw());
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
}
