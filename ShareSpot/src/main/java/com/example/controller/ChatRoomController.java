package com.example.controller;

import com.example.dto.ChatRoomResponse;
import com.example.dto.CreateChatRoomRequest;
import com.example.entity.ChatRoom;
import com.example.entity.Item;
import com.example.repository.ChatRoomRepository;
import com.example.repository.ItemRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatRoomController {

    private final ChatRoomRepository chatRoomRepository;
    private final ItemRepository itemRepository;

    public ChatRoomController(ChatRoomRepository chatRoomRepository, ItemRepository itemRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.itemRepository = itemRepository;
    }

    // ✅ 1) 채팅방 생성(또는 기존 채팅방 반환)
    @PostMapping("/rooms")
    public ChatRoomResponse createOrGetRoom(@RequestBody CreateChatRoomRequest req, HttpSession session) {
        
        String loginUserId = (String) session.getAttribute("LOGIN_USER_ID");
        if (loginUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        if (req == null || req.getItemId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "itemId가 필요합니다.");
        }

        Item item = itemRepository.findById(req.getItemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        String sellerUserId = item.getOwnerUserId();
        if (sellerUserId == null || sellerUserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "물품 작성자 정보가 없습니다.");
        }

        // 본인이 본인에게 채팅 거는 건 막기(선택)
        if (sellerUserId.equals(loginUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "본인 물품에는 채팅을 열 수 없습니다.");
        }

        // 같은 item에 대해 같은 buyer는 방 1개
        ChatRoom room = chatRoomRepository
                .findByItemIdAndBuyerUserId(req.getItemId(), loginUserId)
                .orElseGet(() -> {
                    ChatRoom r = new ChatRoom();
                    r.setItemId(item.getId());
                    r.setItemTitle(item.getTitle()); // ⭐ 이 줄 없으면 undefined
                    r.setBuyerUserId(loginUserId);
                    r.setSellerUserId(item.getOwnerUserId());
                    r.setLastMessage("채팅방이 생성되었습니다.");
                    r.setLastMessageAt(r.getCreatedAt());
                    return chatRoomRepository.save(r);
                });

        // ✅ 방의 참여자가 맞는지(안전)
        if (!(room.getBuyerUserId().equals(loginUserId) || room.getSellerUserId().equals(loginUserId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "접근 권한이 없습니다.");
        }
        return ChatRoomResponse.from(room);
    }

    // ✅ 2) 내 채팅방 목록: 참여자(구매자/판매자)에게만 보이게
    @GetMapping("/rooms")
    public List<ChatRoomResponse> myRooms(HttpSession session) {
        String loginUserId = (String) session.getAttribute("LOGIN_USER_ID");
        if (loginUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        return chatRoomRepository
                .findByBuyerUserIdOrSellerUserIdOrderByCreatedAtDesc(loginUserId, loginUserId)
                .stream()
                .map(ChatRoomResponse::from)
                .toList();
    }
}
//헤헤