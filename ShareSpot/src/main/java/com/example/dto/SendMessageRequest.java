package com.example.dto;

public class SendMessageRequest {
    private Long roomId;
    private String content;

    public Long getRoomId() { return roomId; }
    public String getContent() { return content; }

    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public void setContent(String content) { this.content = content; }
}