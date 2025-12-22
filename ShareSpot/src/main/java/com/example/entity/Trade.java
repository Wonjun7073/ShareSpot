package com.example.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "trades",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_trade_room",
            columnNames = {"chat_room_id"}
        )
    }
)
public class Trade {

    public enum Status {
        IN_PROGRESS,
        COMPLETED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chat_room_id", nullable = false)
    private Long chatRoomId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private String itemTitle;

    @Column(nullable = false)
    private int itemPrice;

    @Column(name = "seller_user_id", nullable = false)
    private String sellerUserId;

    @Column(name = "buyer_user_id", nullable = false)
    private String buyerUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.IN_PROGRESS;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    public Long getId() { return id; }

    public Long getChatRoomId() { return chatRoomId; }
    public void setChatRoomId(Long chatRoomId) { this.chatRoomId = chatRoomId; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public String getItemTitle() { return itemTitle; }
    public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }

    public int getItemPrice() { return itemPrice; }
    public void setItemPrice(int itemPrice) { this.itemPrice = itemPrice; }

    public String getSellerUserId() { return sellerUserId; }
    public void setSellerUserId(String sellerUserId) { this.sellerUserId = sellerUserId; }

    public String getBuyerUserId() { return buyerUserId; }
    public void setBuyerUserId(String buyerUserId) { this.buyerUserId = buyerUserId; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
