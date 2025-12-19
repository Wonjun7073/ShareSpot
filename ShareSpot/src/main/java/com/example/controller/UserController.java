package com.example.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final String USER_ID = "admin";
    private static final String USER_PW = "1234";

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> req) {

        Map<String, Object> res = new HashMap<>();

        String id = req.get("id");
        String pw = req.get("pw");

        if (USER_ID.equals(id) && USER_PW.equals(pw)) {
            res.put("success", true);
            res.put("message", "로그인 성공");
        } else {
            res.put("success", false);
            res.put("message", "아이디 또는 비밀번호가 잘못되었습니다.");
        }

        return res;
    }

    @PostMapping("/logout")
    public Map<String, Object> logout() {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "로그아웃 완료");
        return res;
    }
}
