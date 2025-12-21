package com.example.dto;

public class UpdateProfileRequest {
    private String nickname;
    private String dong;
    private String intro;

    public String getNickname() { return nickname; }
    public String getDong() { return dong; }
    public String getIntro() { return intro; }

    public void setNickname(String nickname) { this.nickname = nickname; }
    public void setDong(String dong) { this.dong = dong; }
    public void setIntro(String intro) { this.intro = intro; }
}
//헤헤