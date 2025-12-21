package com.example.controller;

import com.example.entity.Item;
import com.example.repository.ItemRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemRepository itemRepository;

    public ItemController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    // 1. 게시글 등록
    @PostMapping
    public Item createItem(
            @ModelAttribute Item item,
            @RequestParam(value = "imageFile", required = false) MultipartFile file,
            HttpSession session) throws IOException {
        
        String loginUserId = (String) session.getAttribute("LOGIN_USER_ID");
        if (loginUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        item.setOwnerUserId(loginUserId);

        if (file != null && !file.isEmpty()) {
            // 경로 주의: 실제 존재하는 폴더로 잡아주세요 (C:/uploads/ 등)
            String uploadDir = "C:/uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String originalFilename = file.getOriginalFilename();
            String savedFilename = UUID.randomUUID() + "_" + originalFilename;
            
            file.transferTo(new File(uploadDir + savedFilename));
            // 웹에서 접근 가능한 경로로 설정
            item.setImageUrl("/uploads/" + savedFilename);
        }

        return itemRepository.save(item);
    }

    // 2. 전체 목록 조회
    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAllByOrderByCreatedAtDesc();
    }

    // ▼▼▼▼▼ [여기가 범인입니다!] 이 코드가 없으면 405 에러가 뜹니다 ▼▼▼▼▼
    @GetMapping("/{id}")
    public Item getItem(@PathVariable Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
    }
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    // 3. 게시글 삭제
    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id, HttpSession session) {
        String loginUserId = (String) session.getAttribute("LOGIN_USER_ID");
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        
        if (!item.getOwnerUserId().equals(loginUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        itemRepository.delete(item);
    }
}