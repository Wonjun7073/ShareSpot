package com.example.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "wishlist",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_wishlist_user_item", columnNames = {"user_id", "item_id"})
        },
        indexes = {
                @Index(name = "idx_wishlist_user", columnList = "user_id"),
                @Index(name = "idx_wishlist_item", columnList = "item_id")
        }
)
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Wishlist() {}

    public Wishlist(String userId, Item item) {
        this.userId = userId;
        this.item = item;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public Item getItem() { return item; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
