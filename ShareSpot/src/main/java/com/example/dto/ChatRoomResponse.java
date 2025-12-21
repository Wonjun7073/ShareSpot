package com.example.dto;

import com.example.entity.ChatRoom;

import java.time.LocalDateTime;

public class ChatRoomResponse {
    public Long id;
    public Long itemId;
    public String itemTitle;
    public String buyerUserId;
    public String sellerUserId;
    public LocalDateTime createdAt;
    public String lastMessage;
    public LocalDateTime lastMessageAt;

    public static ChatRoomResponse from(ChatRoom r) {
        ChatRoomResponse o = new ChatRoomResponse();
        o.id = r.getId();
        o.itemId = r.getItemId();
        o.itemTitle = r.getItemTitle();
        o.buyerUserId = r.getBuyerUserId();
        o.sellerUserId = r.getSellerUserId();
        o.createdAt = r.getCreatedAt();
        o.lastMessage = r.getLastMessage();
        o.lastMessageAt = r.getLastMessageAt();
        return o;
    }
}
