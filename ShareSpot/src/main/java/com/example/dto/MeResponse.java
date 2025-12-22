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
    public int trustPercent;
    public String profileInitial;
    public String profileImageUrl;

    public static MeResponse from(User u) {
        MeResponse r = new MeResponse();
        r.id = u.getId();
        r.userId = u.getUserId();
        r.nickname = u.getNickname();
        r.dong = u.getDong();
        r.sharedCount = u.getSharedCount();
        r.thanksCount = u.getThanksCount();
        r.trustPercent = u.getTrustPercent();
        r.profileInitial = u.getProfileInitial();
        r.profileImageUrl = u.getProfileImageUrl();
        return r;
    }
}
//헤헤