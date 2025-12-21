package com.example.controller;

import com.example.entity.Item;
import com.example.repository.ItemRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemRepository itemRepository;

    public ItemController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    // 1) 물품 등록 (로그인 필요 + 작성자 저장)
    @PostMapping
    public Item createItem(@RequestBody Item item, HttpSession session) {
        String loginUserId = (String) session.getAttribute("LOGIN_USER_ID");
        if (loginUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        if (item == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "물품 정보가 없습니다.");
        }

        // ✅ 작성자 강제 세팅 (클라이언트가 보내도 무시)
        item.setOwnerUserId(loginUserId);

        return itemRepository.save(item);
    }

    // 2) 메인 목록
    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAllByOrderByCreatedAtDesc();
    }

    // 3) 삭제 (로그인 필요 + 작성자만 가능)
    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id, HttpSession session) {
        String loginUserId = (String) session.getAttribute("LOGIN_USER_ID");
        if (loginUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 물품입니다."));

        if (item.getOwnerUserId() == null || !item.getOwnerUserId().equals(loginUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 삭제할 수 있습니다.");
        }

        itemRepository.delete(item);
    }
}
//헤헤