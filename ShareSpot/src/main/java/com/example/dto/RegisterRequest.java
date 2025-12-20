package com.example.dto;

public class RegisterRequest {
    private String userId;
    private String password;
    private String nickname;

    public String getUserId() { return userId; }
    public String getPassword() { return password; }
    public String getNickname() { return nickname; }

    public void setUserId(String userId) { this.userId = userId; }
    public void setPassword(String password) { this.password = password; }
    public void setNickname(String nickname) { this.nickname = nickname; }
}
