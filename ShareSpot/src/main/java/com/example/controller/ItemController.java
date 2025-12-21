package com.example.controller;

import com.example.entity.Item;
import com.example.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    // 1. 물품 등록 API (사진 포함 버전)
    @PostMapping
    public Item createItem(
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("price") int price,
            @RequestParam("location") String location,
            @RequestParam("description") String description,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) throws IOException {

        // Item 객체 생성 및 데이터 세팅
        Item item = new Item();
        item.setTitle(title);
        item.setCategory(category);
        item.setPrice(price);
        item.setLocation(location);
        item.setDescription(description);

        // 사진 파일 처리 로직
        if (files != null && !files.isEmpty()) {
            List<String> imagePaths = new ArrayList<>();
            
            // 저장 폴더 설정 (없으면 생성)
            String uploadDir = "C:/uploads/"; 
            File folder = new File(uploadDir);
            if (!folder.exists()) folder.mkdirs();

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    // 파일명 중복 방지를 위한 UUID 생성
                    String originalFileName = file.getOriginalFilename();
                    String savedFileName = UUID.randomUUID().toString() + "_" + originalFileName;
                    
                    // 파일 실제 저장
                    File saveFile = new File(uploadDir, savedFileName);
                    file.transferTo(saveFile);
                    
                    // 저장된 경로 저장 (나중에 불러올 때 사용)
                    imagePaths.add("/uploads/" + savedFileName);
                }
            }
            
            // Item 엔티티에 이미지 경로 저장 (Item 엔티티에 imagePaths 필드가 있다고 가정)
            // 만약 없다면, 아래 주석을 풀고 Item 엔티티에 필드를 추가해야 합니다.
            // item.setImagePaths(imagePaths);
            
            // 임시로 첫 번째 이미지만 대표 이미지로 저장한다면 (Item 엔티티에 imageUrl 필드가 있는 경우)
            if (!imagePaths.isEmpty()) {
                item.setImageUrl(imagePaths.get(0));
            }
        }

        return itemRepository.save(item);
    }

    // 2. 메인 화면용 물품 목록 조회 API
    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAllByOrderByCreatedAtDesc();
    }
}