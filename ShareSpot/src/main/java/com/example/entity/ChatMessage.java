package com.example.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_messages_room_id_id", columnList = "room_id, id")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="room_id", nullable = false)
    private Long roomId;

    @Column(name="sender_user_id", nullable = false)
    private String senderUserId;

    @Column(name="receiver_user_id", nullable = false)
    private String receiverUserId;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name="read_at")
    private LocalDateTime readAt; // null이면 안읽음

    public ChatMessage() {}

    // getters/setters
    public Long getId() { return id; }
    public Long getRoomId() { return roomId; }
    public String getSenderUserId() { return senderUserId; }
    public String getReceiverUserId() { return receiverUserId; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getReadAt() { return readAt; }

    public void setId(Long id) { this.id = id; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public void setSenderUserId(String senderUserId) { this.senderUserId = senderUserId; }
    public void setReceiverUserId(String receiverUserId) { this.receiverUserId = receiverUserId; }
    public void setContent(String content) { this.content = content; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}
