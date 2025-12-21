package com.example.repository;

import com.example.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // 채팅방 생성 시 사용 (이미 있으면 재사용)
    Optional<ChatRoom> findByItemIdAndBuyerUserId(Long itemId, String buyerUserId);

    // ❌ 기존 방식 (퇴장한 방도 다 나옴 → 이제 안 씀)
    // List<ChatRoom> findByBuyerUserIdOrSellerUserIdOrderByCreatedAtDesc(String buyerUserId, String sellerUserId);

    // ✅ 새 방식 (내가 나간 방은 제외)
    @Query("""
        select r from ChatRoom r
        where
          (r.buyerUserId = :userId and r.buyerLeftAt is null)
          or
          (r.sellerUserId = :userId and r.sellerLeftAt is null)
        order by r.createdAt desc
    """)
    List<ChatRoom> findActiveRoomsByUserId(@Param("userId") String userId);
}
