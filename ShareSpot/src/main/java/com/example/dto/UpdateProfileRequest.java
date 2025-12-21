package com.example.dto;

public class UpdateProfileRequest {
    private String nickname;
    private String dong;
    private String intro;
    private String phone;

    public String getNickname() { return nickname; }
    public String getDong() { return dong; }
    public String getPhone() { return phone; }

    public void setNickname(String nickname) { this.nickname = nickname; }
    public void setDong(String dong) { this.dong = dong; }
    public void setPhone(String phone) { this.phone = phone; }
}
//헤헤