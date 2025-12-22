package com.example.controller;

import com.example.dto.TradeResponse;
import com.example.entity.ChatRoom;
import com.example.entity.Item;
import com.example.entity.Trade;
import com.example.repository.ChatRoomRepository;
import com.example.repository.ItemRepository;
import com.example.repository.TradeRepository;
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

    public TradeController(
            TradeRepository tradeRepository,
            ChatRoomRepository chatRoomRepository,
            ItemRepository itemRepository) {
        this.tradeRepository = tradeRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.itemRepository = itemRepository;
    }

    @PostMapping("/from-room/{roomId}")
    public TradeResponse createFromRoom(@PathVariable Long roomId, HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null || me.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다."));

        // 방 참여자만 가능
        if (!me.equals(room.getBuyerUserId()) && !me.equals(room.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "채팅방 참여자가 아닙니다.");
        }

        // 이미 거래가 있으면 그대로 반환
        Trade trade = tradeRepository.findByChatRoomId(roomId).orElse(null);
        if (trade != null) {
            return toResponse(trade, me);
        }

        Item item = itemRepository.findById(room.getItemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "물품을 찾을 수 없습니다."));

        // ✅ 판매자는 아이템 owner로 확정
        String seller = item.getOwnerUserId();      // 너희 Item 엔티티에 맞춰둠 (ownerUserId)
        String buyer = room.getBuyerUserId();

        // ✅ 잘못된 방 방어 (구매자=판매자 또는 구매자 없음)
        if (buyer == null || buyer.isBlank() || buyer.equals(seller)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "구매자 정보가 올바르지 않은 채팅방입니다. (구매자=판매자)"
            );
        }

        // ✅ room에 저장된 seller가 owner와 다르면 owner 기준으로 교정(선택)
        if (room.getSellerUserId() == null || !room.getSellerUserId().equals(seller)) {
            room.setSellerUserId(seller);
            chatRoomRepository.save(room);
        }

        Trade t = new Trade();
        t.setChatRoomId(room.getId());
        t.setItemId(item.getId());
        t.setItemTitle(item.getTitle());
        t.setItemPrice(item.getPrice());
        t.setSellerUserId(seller);
        t.setBuyerUserId(buyer);
        t.setStatus(Trade.Status.IN_PROGRESS);

        Trade saved = tradeRepository.save(t);
        return toResponse(saved, me);
    }

    @GetMapping("/my")
    public List<TradeResponse> myTrades(HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null || me.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        List<Trade> asSeller = tradeRepository.findBySellerUserIdOrderByCreatedAtDesc(me);
        List<Trade> asBuyer = tradeRepository.findByBuyerUserIdOrderByCreatedAtDesc(me);

        // ✅ tradeId 기준 중복 제거
        Map<Long, Trade> uniq = new LinkedHashMap<>();
        for (Trade t : asSeller) {
            uniq.put(t.getId(), t);
        }
        for (Trade t : asBuyer) {
            uniq.put(t.getId(), t);
        }

        List<TradeResponse> out = new ArrayList<>();
        for (Trade t : uniq.values()) {
            out.add(toResponse(t, me));
        }
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
        return toResponse(saved, me);
    }

    @GetMapping("/room/{roomId}")
    public TradeResponse getByRoom(@PathVariable Long roomId, HttpSession session) {
        String me = (String) session.getAttribute(LOGIN_USER_ID);
        if (me == null || me.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        Trade t = tradeRepository.findByChatRoomId(roomId).orElse(null);
        if (t == null) return null;

        if (!me.equals(t.getBuyerUserId()) && !me.equals(t.getSellerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한이 없습니다.");
        }
        return toResponse(t, me);
    }

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

        String role = me.equals(t.getSellerUserId()) ? "SELLER" : "BUYER";
        r.setMyRole(role);
        r.setCanComplete("BUYER".equals(role) && "IN_PROGRESS".equals(r.getStatus()));
        return r;
    }
}
