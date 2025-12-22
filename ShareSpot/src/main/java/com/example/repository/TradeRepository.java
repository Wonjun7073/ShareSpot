package com.example.repository;

import com.example.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TradeRepository extends JpaRepository<Trade, Long> {

    Optional<Trade> findByChatRoomId(Long chatRoomId);

    List<Trade> findBySellerUserIdOrderByCreatedAtDesc(String sellerUserId);

    List<Trade> findByBuyerUserIdOrderByCreatedAtDesc(String buyerUserId);
}
