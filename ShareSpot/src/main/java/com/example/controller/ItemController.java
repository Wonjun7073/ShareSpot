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

    @PostMapping
    public Item createItem(
            @ModelAttribute Item item, // JSON 아님!
            @RequestParam(value = "imageFile", required = false) MultipartFile file,
            HttpSession session) throws IOException {

        String loginUserId = (String) session.getAttribute("LOGIN_USER_ID");
        if (loginUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        item.setOwnerUserId(loginUserId);

        // 파일 저장 로직
        if (file != null && !file.isEmpty()) {
            String uploadDir = "C:/uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String originalFilename = file.getOriginalFilename();
            String savedFilename = UUID.randomUUID() + "_" + originalFilename;
            
            file.transferTo(new File(uploadDir + savedFilename));
            item.setImageUrl("/uploads/" + savedFilename);
        }

        return itemRepository.save(item);
    }

    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAllByOrderByCreatedAtDesc();
    }

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