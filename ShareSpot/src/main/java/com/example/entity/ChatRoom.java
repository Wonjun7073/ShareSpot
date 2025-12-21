package com.example.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "chat_rooms", uniqueConstraints = {
        // 같은 item에 대해 같은 buyer는 채팅방 1개만
        @UniqueConstraint(name = "uk_chat_room_item_buyer", columnNames = { "item_id", "buyer_user_id" })
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

    // 목록 미리보기용(지금은 없어도 되지만 나중에 편함)
    private LocalDateTime lastMessageAt;
    @Column(length = 500)
    private String lastMessage;
}
