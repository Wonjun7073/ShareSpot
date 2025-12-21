package com.example.repository;

import com.example.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    Optional<ChatRoom> findByItemIdAndBuyerUserId(Long itemId, String buyerUserId);

    // ✅ 참여자(구매자 or 판매자)인 방만 조회
    List<ChatRoom> findByBuyerUserIdOrSellerUserIdOrderByCreatedAtDesc(String buyerUserId, String sellerUserId);
}


