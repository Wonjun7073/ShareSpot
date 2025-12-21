package com.example.controller;

import com.example.dto.ChatRoomResponse;
import com.example.dto.CreateChatRoomRequest;
import com.example.entity.ChatRoom;
import com.example.entity.Item;
import com.example.repository.ChatMessageRepository;
import com.example.repository.ChatRoomRepository;
import com.example.repository.ItemRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatRoomController {

    private static final String LOGIN_USER_ID = "LOGIN_USER_ID";

    private final ChatRoomRepository chatRoomRepository;
    private final ItemRepository itemRepository;
    private final ChatMessageRepository chatMessageRepository;

    public ChatRoomController(
            ChatRoomRepository chatRoomRepository,
            ItemRepository itemRepository,
            ChatMessageRepository chatMessageRepository
    ) {
        this.chatRoomRepository = chatRoomRepository;
        this.itemRepository = itemRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    /* =====================================================
     * 채팅방 생성 (이미 있으면 기존 방 반환)
     * ===================================================== */
    @PostMapping("/rooms")
    public ChatRoomResponse createRoom(
            @RequestBody CreateChatRoomRequest req,
            HttpSession session
    ) {
        String buyerUserId = (String) session.getAttribute(LOGIN_USER_ID);
        if (buyerUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        Long itemId = req.getItemId();
        if (itemId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "itemId가 필요합니다.");
        }

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "아이템이 없습니다."));

        String sellerUserId = item.getOwnerUserId();
        if (sellerUserId == null || sellerUserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "판매자 정보가 없습니다.");
        }

        // 본인 글에 채팅 생성 방지
        if (buyerUserId.equals(sellerUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "본인 글에는 채팅을 생성할 수 없습니다.");
        }

        // 같은 item + 같은 buyer는 채팅방 1개
        ChatRoom room = chatRoomRepository
                .findByItemIdAndBuyerUserId(itemId, buyerUserId)
                .orElseGet(() -> {
                    ChatRoom r = new ChatRoom();
                    r.setItemId(itemId);
                    r.setItemTitle(item.getTitle());
                    r.setBuyerUserId(buyerUserId);
                    r.setSellerUserId(sellerUserId);
                    r.setCreatedAt(LocalDateTime.now());
                    return chatRoomRepository.save(r);
                });

        return ChatRoomResponse.from(room);
    }

    /* =====================================================
     * 내 채팅방 목록 (✅ 내가 나간 방은 제외)
     * ===================================================== */
    @GetMapping("/rooms")
    public List<ChatRoomResponse> myRooms(HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        return chatRoomRepository
                .findActiveRoomsByUserId(me) // ✅ 핵심 변경
                .stream()
                .map(r -> {
                    ChatRoomResponse dto = ChatRoomResponse.from(r);
                    dto.unreadCount = (int) chatMessageRepository
                            .countByRoomIdAndReceiverUserIdAndReadAtIsNull(r.getId(), me);
                    return dto;
                })
                .toList();
    }

    /* =====================================================
     * 채팅방 읽음 처리
     * ===================================================== */
    @PostMapping("/rooms/{roomId}/read")
    public void markRead(@PathVariable Long roomId, HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방이 없습니다."));

        if (!me.equals(room.getBuyerUserId()) && !me.equals(room.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "참여자가 아닙니다.");
        }

        var list = chatMessageRepository
                .findByRoomIdAndReceiverUserIdAndReadAtIsNull(roomId, me);

        if (list.isEmpty()) return;

        var now = LocalDateTime.now();
        for (var m : list) {
            m.setReadAt(now);
        }
        chatMessageRepository.saveAll(list);
    }

    /* =====================================================
     * 채팅방 단건 조회 (✅ 나간 방 재입장 차단)
     * ===================================================== */
    @GetMapping("/rooms/{roomId}")
    public ChatRoomResponse getRoom(@PathVariable Long roomId, HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방이 없습니다."));

        if (!me.equals(room.getBuyerUserId()) && !me.equals(room.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "참여자가 아닙니다.");
        }

        // ✅ 내가 이미 나간 방이면 접근 불가
        if (me.equals(room.getBuyerUserId()) && room.getBuyerLeftAt() != null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이미 나간 채팅방입니다.");
        }
        if (me.equals(room.getSellerUserId()) && room.getSellerLeftAt() != null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이미 나간 채팅방입니다.");
        }

        return ChatRoomResponse.from(room);
    }

    /* =====================================================
     * 채팅방 나가기 (✅ 진짜 퇴장)
     * ===================================================== */
    @PostMapping("/rooms/{roomId}/leave")
    public void leaveRoom(@PathVariable Long roomId, HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방이 없습니다."));

        if (me.equals(room.getBuyerUserId())) {
            room.setBuyerLeftAt(LocalDateTime.now());
        } else if (me.equals(room.getSellerUserId())) {
            room.setSellerLeftAt(LocalDateTime.now());
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "참여자가 아닙니다.");
        }

        chatRoomRepository.save(room);
    }
}
