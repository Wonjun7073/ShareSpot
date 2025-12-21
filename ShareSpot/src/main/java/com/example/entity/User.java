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

    @Column(length = 500)
    private String intro = "";        // 소개

    private String phone = "";
    private String email = "";

    @Column(nullable = false)
    private int sharedCount = 0;

    @Column(nullable = false)
    private int thanksCount = 0;

    @Column(nullable = false)
    private int trustPercent = 0;     // 0~100

    private String profileInitial = ""; // 예: "김"

    // 기본 생성자 (JPA 필수)
    public User() {}

    public User(String userId, String password) {
        this.userId = userId;
        this.password = password;
    }

    // ===== getters =====
    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public String getPassword() { return password; }
    public String getNickname() { return nickname; }
    public String getDong() { return dong; }
    public String getIntro() { return intro; }
    public String getPhone() { return phone; }
    public int getSharedCount() { return sharedCount; }
    public int getThanksCount() { return thanksCount; }
    public int getTrustPercent() { return trustPercent; }
    public String getProfileInitial() { return profileInitial; }

    // ===== setters =====
    public void setId(Long id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setPassword(String password) { this.password = password; }

    public void setNickname(String nickname) { this.nickname = nickname; }
    public void setDong(String dong) { this.dong = dong; }
    public void setIntro(String intro) { this.intro = intro; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setEmail(String email) { this.email = email; }
    public void setSharedCount(int sharedCount) { this.sharedCount = sharedCount; }
    public void setThanksCount(int thanksCount) { this.thanksCount = thanksCount; }
    public void setTrustPercent(int trustPercent) { this.trustPercent = trustPercent; }
    public void setProfileInitial(String profileInitial) { this.profileInitial = profileInitial; }
}
//헤헤