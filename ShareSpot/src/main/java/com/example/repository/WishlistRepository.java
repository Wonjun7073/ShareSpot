package com.example.repository;

import com.example.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    List<Wishlist> findByUserIdOrderByCreatedAtDesc(String userId);

    boolean existsByUserIdAndItem_Id(String userId, Long itemId);

    Optional<Wishlist> findByUserIdAndItem_Id(String userId, Long itemId);

    long deleteByUserIdAndItem_Id(String userId, Long itemId);

    long countByUserId(String userId);

}
