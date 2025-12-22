package com.example.dto;

import java.time.LocalDateTime;

public class TradeResponse {

    private Long tradeId;
    private Long chatRoomId;
    private Long itemId;
    private String itemTitle;
    private int itemPrice;

    private String sellerUserId;
    private String buyerUserId;

    private String status; // IN_PROGRESS / COMPLETED
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    private String myRole; // SELLER / BUYER
    private boolean canComplete; // buyer && IN_PROGRESS

    public Long getTradeId() { return tradeId; }
    public void setTradeId(Long tradeId) { this.tradeId = tradeId; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getMyRole() { return myRole; }
    public void setMyRole(String myRole) { this.myRole = myRole; }

    public boolean isCanComplete() { return canComplete; }
    public void setCanComplete(boolean canComplete) { this.canComplete = canComplete; }
}
