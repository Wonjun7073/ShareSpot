package com.example.dto;

import com.example.entity.ChatMessage;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;

public class ChatMessageResponse {
    public Long id;
    public Long roomId;
    public String senderUserId;
    public String receiverUserId;
    public String content;
    public LocalDateTime createdAt;
    public LocalDateTime readAt;

    public static ChatMessageResponse from(ChatMessage m) {
        ChatMessageResponse r = new ChatMessageResponse();
        r.id = m.getId();
        r.roomId = m.getRoomId();
        r.senderUserId = m.getSenderUserId();
        r.receiverUserId = m.getReceiverUserId();
        r.content = m.getContent();
        r.createdAt = m.getCreatedAt();
        r.readAt = m.getReadAt();
        return r;
    }

    public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

        int countByRoomIdAndReceiverUserIdAndReadAtIsNull(
                Long roomId,
                String receiverUserId);
    }
}
