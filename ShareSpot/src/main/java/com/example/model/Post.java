package com.example.model;

public class Post {
    private String title;
    private String category;
    private String location;
    private String price;
    private String timeAgo;
    private int chatCount;
    private int interestCount;

    public Post(String title, String category, String location, String price, String timeAgo, int chatCount, int interestCount) {
        this.title = title;
        this.category = category;
        this.location = location;
        this.price = price;
        this.timeAgo = timeAgo;
        this.chatCount = chatCount;
        this.interestCount = interestCount;
    }

    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getLocation() { return location; }
    public String getPrice() { return price; }
    public String getTimeAgo() { return timeAgo; }
    public int getChatCount() { return chatCount; }
    public int getInterestCount() { return interestCount; }
}