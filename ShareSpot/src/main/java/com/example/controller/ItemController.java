package com.example.controller;

import com.example.entity.Item;
import com.example.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    // 1. 물품 등록 API
    @PostMapping
    public Item createItem(@RequestBody Item item) {
        if (item == null) {
            throw new IllegalArgumentException("물품 정보가 없습니다.");
        }
        return itemRepository.save(item);
    }

    // 2. 메인 화면용 물품 목록 조회 API
    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAllByOrderByCreatedAtDesc();
    }
}