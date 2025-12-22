// src/main/java/com/example/controller/TradeController.java
package com.example.controller;

import com.example.dto.TradeResponse;
import com.example.entity.ChatRoom;
import com.example.entity.Item;
import com.example.entity.Trade;
import com.example.entity.User;
import com.example.repository.ChatRoomRepository;
import com.example.repository.ItemRepository;
import com.example.repository.TradeRepository;
import com.example.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trades")
public class TradeController {

    private static final String LOGIN_USER_ID = "LOGIN_USER_ID";

    private final TradeRepository tradeRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public TradeController(
            TradeRepository tradeRepository,
            ChatRoomRepository chatRoomRepository,
            ItemRepository itemRepository,
            UserRepository userRepository
    ) {
        this.tradeRepository = tradeRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/from-room/{roomId}")
    public TradeResponse createFromRoom(@PathVariable Long roomId, HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null || me.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다."));

        if (!me.equals(room.getBuyerUserId()) && !me.equals(room.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "채팅방 참여자가 아닙니다.");
        }

        Trade exists = tradeRepository.findByChatRoomId(roomId).orElse(null);
        if (exists != null) {
            return toResponse(exists, me);
        }

        Item item = itemRepository.findById(room.getItemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "아이템을 찾을 수 없습니다."));

        Trade t = new Trade();
        t.setChatRoomId(roomId);
        t.setItemId(item.getId());
        t.setItemTitle(item.getTitle());
        t.setItemPrice(item.getPrice());

        t.setSellerUserId(room.getSellerUserId());
        t.setBuyerUserId(room.getBuyerUserId());

        t.setStatus(Trade.Status.IN_PROGRESS);
        t.setCreatedAt(LocalDateTime.now());

        Trade saved = tradeRepository.save(t);
        return toResponse(saved, me);
    }

    @GetMapping("/my")
    public List<TradeResponse> my(HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null || me.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        List<Trade> trades = tradeRepository.findByBuyerUserIdOrSellerUserIdOrderByIdDesc(me, me);

        List<TradeResponse> out = new ArrayList<>();
        for (Trade t : trades) out.add(toResponse(t, me));
        return out;
    }

    @PostMapping("/{tradeId}/complete")
    public TradeResponse complete(@PathVariable Long tradeId, HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null || me.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        Trade t = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "거래를 찾을 수 없습니다."));

        if (!me.equals(t.getBuyerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "구매자만 거래 완료할 수 있습니다.");
        }

        if (t.getStatus() == Trade.Status.COMPLETED) {
            return toResponse(t, me);
        }

        t.setStatus(Trade.Status.COMPLETED);
        t.setCompletedAt(LocalDateTime.now());
        Trade saved = tradeRepository.save(t);

        // ✅ 거래 완료 시 글 등록자(판매자) 신뢰 점수 +10 (최대 500)
        User seller = userRepository.findByUserId(saved.getSellerUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "판매자를 찾을 수 없습니다."));
        seller.setTrustScore(seller.getTrustScore() + 10);
        userRepository.save(seller);

        return toResponse(saved, me);
    }

    @GetMapping("/room/{roomId}")
    public TradeResponse getByRoom(@PathVariable Long roomId, HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null || me.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        Trade t = tradeRepository.findByChatRoomId(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "거래가 없습니다."));

        if (!me.equals(t.getBuyerUserId()) && !me.equals(t.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "거래 참여자가 아닙니다.");
        }

        return toResponse(t, me);
    }

    // TradeController.java 안의 toResponse(...)도 이 DTO에 맞춰서 이렇게 써야 함
private TradeResponse toResponse(Trade t, String me) {
    TradeResponse r = new TradeResponse();

    r.setTradeId(t.getId());
    r.setChatRoomId(t.getChatRoomId());
    r.setItemId(t.getItemId());
    r.setItemTitle(t.getItemTitle());
    r.setItemPrice(t.getItemPrice());

    r.setSellerUserId(t.getSellerUserId());
    r.setBuyerUserId(t.getBuyerUserId());

    r.setStatus(t.getStatus().name());
    r.setCreatedAt(t.getCreatedAt());
    r.setCompletedAt(t.getCompletedAt());

    boolean isBuyer = me != null && me.equals(t.getBuyerUserId());
    r.setMyRole(me != null && me.equals(t.getSellerUserId()) ? "SELLER" : "BUYER");
    r.setCanComplete(isBuyer && t.getStatus() == Trade.Status.IN_PROGRESS);

    return r;
}

}
