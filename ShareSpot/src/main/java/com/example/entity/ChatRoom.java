package com.example.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "chat_rooms", uniqueConstraints = {
    @UniqueConstraint(
        name = "uk_chat_room_item_buyer",
        columnNames = { "item_id", "buyer_user_id" }
    )
})
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "buyer_user_id", nullable = false)
    private String buyerUserId;

    @Column(name = "seller_user_id", nullable = false)
    private String sellerUserId;

    @Column(nullable = false)
    private String itemTitle;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // 목록 미리보기용
    private LocalDateTime lastMessageAt;

    @Column(length = 500)
    private String lastMessage;

    // =========================
    // ✅ 퇴장 상태 (추가)
    // =========================
    private LocalDateTime buyerLeftAt;
    private LocalDateTime sellerLeftAt;
}
