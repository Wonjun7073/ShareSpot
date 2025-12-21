package com.example.repository;

import com.example.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByRoomIdOrderByIdAsc(Long roomId);

    List<ChatMessage> findByRoomIdAndIdGreaterThanOrderByIdAsc(Long roomId, Long afterId);

    long countByRoomIdAndReceiverUserIdAndReadAtIsNull(Long roomId, String receiverUserId);

    long countByRoomIdAndReceiverUserIdAndReadAtIsNullAndIdLessThanEqual(Long roomId, String receiverUserId, Long upToId);

    List<ChatMessage> findByRoomIdAndReceiverUserIdAndReadAtIsNull(Long roomId, String receiverUserId);

    void deleteByRoomId(Long roomId);

    // 읽음 처리용 (bulk update 대신 간단하게 가져와서 setReadAt 저장)
}