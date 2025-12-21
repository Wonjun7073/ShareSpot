package com.example.controller;

import com.example.entity.Item;
import com.example.entity.Wishlist;
import com.example.repository.ItemRepository;
import com.example.repository.WishlistRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final ItemRepository itemRepository;

    public WishlistController(WishlistRepository wishlistRepository, ItemRepository itemRepository) {
        this.wishlistRepository = wishlistRepository;
        this.itemRepository = itemRepository;
    }

    /**
     * ✅ 세션에서 로그인 유저 ID 얻기
     * - 프로젝트마다 세션 키 이름이 달라서 여러 후보를 순서대로 확인
     * - 너희 프로젝트에 맞는 키 하나로 확정되면 이 함수에서 나머지는 지워도 됨
     */
    private String getLoginUserId(HttpSession session) {
        if (session == null)
            return null;

        // 1) 가장 흔한 케이스들
        Object v1 = session.getAttribute("LOGIN_USER_ID");
        if (v1 != null)
            return String.valueOf(v1);

        Object v2 = session.getAttribute("userId");
        if (v2 != null)
            return String.valueOf(v2);

        Object v3 = session.getAttribute("loginUserId");
        if (v3 != null)
            return String.valueOf(v3);

        // 2) 로그인 유저 객체를 통째로 넣는 경우 (예: session.setAttribute("loginUser", user))
        Object u1 = session.getAttribute("loginUser");
        if (u1 != null) {
            // 프로젝트마다 필드명이 다를 수 있음. 아래는 대표적인 패턴들만 시도.
            // 필드/메서드 이름이 다르면 로그인 객체 클래스(User/Member)의 getter로 맞춰줘야 함.
            try {
                // getUserId()
                return (String) u1.getClass().getMethod("getUserId").invoke(u1);
            } catch (Exception ignore) {
            }
            try {
                // getId()
                return String.valueOf(u1.getClass().getMethod("getId").invoke(u1));
            } catch (Exception ignore) {
            }
        }

        return null;
    }

    /** ✅ 내 관심목록 조회: Item[] 반환 */
    @GetMapping
    public List<Map<String, Object>> list(HttpSession session) {
        String userId = getLoginUserId(session);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        List<Wishlist> wishes = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return wishes.stream().map(w -> {
            Item item = w.getItem();

            Map<String, Object> m = new HashMap<>();
            m.put("id", item.getId());
            m.put("title", item.getTitle());
            m.put("description", item.getDescription());
            m.put("price", item.getPrice());
            m.put("category", item.getCategory());
            m.put("location", item.getLocation());
            m.put("imageUrl", item.getImageUrl());
            m.put("createdAt", item.getCreatedAt());
            m.put("ownerUserId", item.getOwnerUserId());
            return m;
        }).collect(java.util.stream.Collectors.toList());
    }

    /** ✅ 특정 글이 내 관심인지 여부 */
    @GetMapping("/{itemId}/status")
    public Map<String, Object> status(@PathVariable Long itemId, HttpSession session) {
        String userId = getLoginUserId(session);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        boolean wished = wishlistRepository.existsByUserIdAndItem_Id(userId, itemId);

        Map<String, Object> res = new HashMap<>();
        res.put("wished", wished);
        return res;
    }

    /** ✅ 관심 등록 */
    @PostMapping("/{itemId}")
    public Map<String, Object> add(@PathVariable Long itemId, HttpSession session) {
        String userId = getLoginUserId(session);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        // 이미 있으면 중복 저장 방지
        if (!wishlistRepository.existsByUserIdAndItem_Id(userId, itemId)) {
            wishlistRepository.save(new Wishlist(userId, item));
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("wished", true);
        return res;
    }

    /** ✅ 관심 해제 */
    @Transactional
    @DeleteMapping("/{itemId}")
    public Map<String, Object> remove(@PathVariable Long itemId, HttpSession session) {
        String userId = getLoginUserId(session);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        long deleted = wishlistRepository.deleteByUserIdAndItem_Id(userId, itemId);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("wished", false);
        res.put("deleted", deleted); // ✅ 몇 건 삭제됐는지 확인용
        return res;
    }

    @GetMapping("/count")
    public Map<String, Object> count(HttpSession session) {
        String userId = getLoginUserId(session);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        long cnt = wishlistRepository.countByUserId(userId);

        Map<String, Object> res = new HashMap<>();
        res.put("count", cnt);
        return res;
    }

}
