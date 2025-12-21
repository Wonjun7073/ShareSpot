package com.example.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title; // 물품 제목
    private String category; // 나눔, 대여, 교환
    private Integer price; // 가격 (나눔은 0원)
    private String location; // 거래 희망 장소
    @Column(columnDefinition = "TEXT")
    private String description; // 자세한 설명
    @Column(nullable = false)
    private String ownerUserId;

    private LocalDateTime createdAt = LocalDateTime.now(); // 등록 시간
}//헤헤