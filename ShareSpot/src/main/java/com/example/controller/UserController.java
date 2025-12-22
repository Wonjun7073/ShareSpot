package com.example.controller;

import com.example.dto.LoginRequest;
import com.example.dto.MeResponse;
import com.example.dto.RegisterRequest;
import com.example.dto.UpdateProfileRequest;
import com.example.service.UserService;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final String LOGIN_USER_ID = "LOGIN_USER_ID";

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest req, HttpSession session) {
        Map<String, Object> res = new HashMap<>();

        boolean success = userService.login(req.getUserId(), req.getPassword());

        if (success) {
            session.setAttribute(LOGIN_USER_ID, req.getUserId().trim());
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
    @DeleteMapping("/me")
public Map<String, Object> withdraw(HttpSession session) {
    String loginUserId = (String) session.getAttribute(LOGIN_USER_ID);
    if (loginUserId == null) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", false);
        res.put("message", "로그인이 필요합니다.");
        return res;
    }

    userService.withdrawWithRelated(loginUserId);
    session.invalidate();

    Map<String, Object> res = new HashMap<>();
    res.put("success", true);
    res.put("message", "탈퇴 완료");
    return res;
}


    @GetMapping("/me")
    public MeResponse me(HttpSession session) {
        String loginUserId = (String) session.getAttribute(LOGIN_USER_ID);
        if (loginUserId == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return MeResponse.from(userService.getMe(loginUserId));
    }

    @PutMapping(value = "/me", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public MeResponse updateMe(
            @RequestParam("nickname") String nickname,
            @RequestParam("dong") String dong,
            // [변경] phone 삭제, introduction 추가 (필수 아님: required = false)
            @RequestParam(value = "introduction", required = false) String introduction,
            @RequestParam(value = "profileImage", required = false) org.springframework.web.multipart.MultipartFile file,
            HttpSession session) {

        String loginUserId = (String) session.getAttribute(LOGIN_USER_ID);
        if (loginUserId == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        try {
            // [변경] 서비스 호출 시 phone 대신 introduction 전달
            return MeResponse.from(userService.updateMe(loginUserId, nickname, dong, introduction, file));
        } catch (Exception e) {
            e.printStackTrace();
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "수정 중 오류 발생: " + e.getMessage());
        }
    }
    @PutMapping("/password")
public Map<String, Object> changePassword(
        @RequestBody Map<String, String> req,
        HttpSession session
) {
    String loginUserId = (String) session.getAttribute(LOGIN_USER_ID);
    if (loginUserId == null) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
    }

    try {
        userService.changePassword(
                loginUserId,
                req.get("currentPassword"),
                req.get("newPassword")
        );

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "비밀번호 변경 완료");
        return res;

    } catch (IllegalArgumentException e) {
        // 현재 비번 불일치 같은 케이스
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    } catch (Exception e) {
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류");
    }
}


}