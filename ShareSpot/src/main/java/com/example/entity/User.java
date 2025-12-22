// src/main/java/com/example/entity/User.java
package com.example.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", unique = true, nullable = false)
    private String userId;

    @Column(nullable = false)
    private String password;

    // === 마이페이지용 필드 ===
    @Column(nullable = false)
    private String nickname = "";     // 화면에 보여줄 닉네임

    @Column(nullable = false)
    private String dong = "";         // 예: 시흥시 정왕동

    private String phone = "";

    @Column(nullable = false)
    private int sharedCount = 0;

    @Column(nullable = false)
    private int thanksCount = 0;

    // ✅ 신뢰 점수 (0~500)
    @Column(nullable = false)
    private int trustScore = 0;

    private String profileImageUrl;

    // (기존 유지) 신뢰도 퍼센트 (0~100) - trustScore 기반으로 맞춰서 반환/설정
    @Column(nullable = false)
    private int trustPercent = 0;     // 0~100

    private String profileInitial = ""; // 예: "김"

    // 기본 생성자 (JPA 필수)
    public User() {}

    public User(String userId, String password) {
        this.userId = userId;
        this.password = password;
    }

    @Column(length = 500) // 길이를 넉넉하게 500자 정도로 설정
    private String introduction;

    // Getter, Setter 추가 (Lombok @Data를 쓴다면 생략 가능)
    public String getIntroduction() {
        return introduction;
    }

    public void setIntroduction(String introduction) {
        this.introduction = introduction;
    }

    // ===== getters =====
    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public String getPassword() { return password; }

    public String getNickname() { return nickname; }
    public String getDong() { return dong; }
    public String getPhone() { return phone; }
    public int getSharedCount() { return sharedCount; }
    public int getThanksCount() { return thanksCount; }

    public int getTrustScore() { return trustScore; }

    public int getTrustPercent() {
        int pct = (int) Math.round((Math.max(0, Math.min(100, trustScore)) / 100.0) * 100.0);
        this.trustPercent = Math.max(0, Math.min(100, pct));
        return this.trustPercent;
    }

    public String getProfileImageUrl() { return profileImageUrl; }

    public String getProfileInitial() { return profileInitial; }

    // ===== setters =====
    public void setId(Long id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setPassword(String password) { this.password = password; }

    public void setNickname(String nickname) { this.nickname = nickname; }
    public void setDong(String dong) { this.dong = dong; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setSharedCount(int sharedCount) { this.sharedCount = sharedCount; }
    public void setThanksCount(int thanksCount) { this.thanksCount = thanksCount; }

    public void setTrustScore(int trustScore) {
        int clamped = Math.max(0, Math.min(100, trustScore));
        this.trustScore = clamped;

        this.trustPercent = (int) Math.round((clamped / 100.0) * 100.0);
        this.trustPercent = Math.max(0, Math.min(100, this.trustPercent));
    }

    public void setTrustPercent(int trustPercent) {
        int pct = Math.max(0, Math.min(100, trustPercent));
        this.trustPercent = pct;

        this.trustScore = (int) Math.round((pct / 100.0) * 100.0);
        this.trustScore = Math.max(0, Math.min(100, this.trustScore));
    }

    public void setProfileInitial(String profileInitial) { this.profileInitial = profileInitial; }

    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
}
