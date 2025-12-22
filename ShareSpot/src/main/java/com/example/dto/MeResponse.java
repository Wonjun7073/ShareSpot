// src/main/java/com/example/dto/MeResponse.java
package com.example.dto;

import com.example.entity.User;

public class MeResponse {
    public Long id;
    public String userId;
    public String nickname;
    public String dong;
    public String intro;
    public int sharedCount;
    public int thanksCount;

    // ✅ 추가: 신뢰 점수 (0~500)
    public int trustScore;

    // (기존 유지) 신뢰도 퍼센트 (0~100)
    public int trustPercent;

    public String profileInitial;

    public static MeResponse from(User u) {
        MeResponse r = new MeResponse();
        r.id = u.getId();
        r.userId = u.getUserId();
        r.nickname = u.getNickname();
        r.dong = u.getDong();
        r.sharedCount = u.getSharedCount();
        r.thanksCount = u.getThanksCount();
        r.trustScore = u.getTrustScore();
        r.trustPercent = u.getTrustPercent();
        r.profileInitial = u.getProfileInitial();
        return r;
    }
}
