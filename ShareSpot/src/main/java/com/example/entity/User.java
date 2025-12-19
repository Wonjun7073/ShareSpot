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

    // 기본 생성자 (JPA 필수)
    public User() {}

    public User(String userId, String password) {
        this.userId = userId;
        this.password = password;
    }

    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public String getPassword() { return password; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setPassword(String password) { this.password = password; }
}
