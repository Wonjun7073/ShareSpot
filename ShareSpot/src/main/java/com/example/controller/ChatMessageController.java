package com.example.controller;

import com.example.dto.ChatMessageResponse;
import com.example.dto.SendMessageRequest;
import com.example.entity.ChatMessage;
import com.example.entity.ChatRoom;
import com.example.repository.ChatMessageRepository;
import com.example.repository.ChatRoomRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatMessageController {

    private static final String LOGIN_USER_ID = "LOGIN_USER_ID";

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageController(ChatRoomRepository chatRoomRepository,
            ChatMessageRepository chatMessageRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    // ✅ 메시지 전송
    @PostMapping("/messages")
    public ChatMessageResponse send(@RequestBody SendMessageRequest req, HttpSession session) {
        String sender = (String) session.getAttribute(LOGIN_USER_ID);
        if (sender == null)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");

        Long roomId = req.getRoomId();
        String content = req.getContent() == null ? "" : req.getContent().trim();

        if (roomId == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "roomId가 필요합니다.");
        if (content.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "메시지를 입력하세요.");
        if (content.length() > 1000)
            content = content.substring(0, 1000);

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방이 없습니다."));

        // receiver 계산 (1:1)
        String receiver;
        if (sender.equals(room.getBuyerUserId()))
            receiver = room.getSellerUserId();
        else if (sender.equals(room.getSellerUserId()))
            receiver = room.getBuyerUserId();
        else
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "참여자가 아닙니다.");

        ChatMessage m = new ChatMessage();
        m.setRoomId(roomId);
        m.setSenderUserId(sender);
        m.setReceiverUserId(receiver);
        m.setContent(content);

        ChatMessage saved = chatMessageRepository.save(m);

        // 채팅방 목록 미리보기 업데이트
        room.setLastMessage(content);
        room.setLastMessageAt(saved.getCreatedAt());
        chatRoomRepository.save(room);

        return ChatMessageResponse.from(saved);
    }

    // ✅ 메시지 목록 조회 (폴링용 afterId 지원)
    @GetMapping("/messages")
    public List<ChatMessageResponse> list(@RequestParam Long roomId,
            @RequestParam(required = false) Long afterId,
            HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방이 없습니다."));

        // 참여자 체크
        if (!me.equals(room.getBuyerUserId()) && !me.equals(room.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "참여자가 아닙니다.");
        }

        List<ChatMessage> msgs = (afterId == null)
                ? chatMessageRepository.findByRoomIdOrderByIdAsc(roomId)
                : chatMessageRepository.findByRoomIdAndIdGreaterThanOrderByIdAsc(roomId, afterId);

        return msgs.stream().map(ChatMessageResponse::from).toList();
    }
}