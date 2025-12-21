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

    // 1) 물품 등록 (파일 업로드 추가됨)
    @PostMapping
    public Item createItem(
            @ModelAttribute Item item, // @RequestBody가 아니라 @ModelAttribute여야 파일과 글을 같이 받습니다!
            @RequestParam(value = "imageFile", required = false) MultipartFile file, // 파일 받기
            HttpSession session) throws IOException {

        String loginUserId = (String) session.getAttribute("LOGIN_USER_ID");
        if (loginUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        // 작성자 설정
        item.setOwnerUserId(loginUserId);

        // 파일 업로드 처리
        if (file != null && !file.isEmpty()) {
            // 저장할 경로 (WebConfig 설정과 일치해야 함)
            String uploadDir = "C:/uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs(); // 폴더가 없으면 자동으로 만들어줍니다.
            }

            // 파일명 중복 방지 (랜덤이름_원래이름.jpg)
            String originalFilename = file.getOriginalFilename();
            String savedFilename = UUID.randomUUID() + "_" + originalFilename;

            // 실제 파일 저장
            file.transferTo(new File(uploadDir + savedFilename));

            // DB에는 "이 주소로 가면 이미지 보여줘"라고 경로만 저장
            item.setImageUrl("/uploads/" + savedFilename);
        }

        return itemRepository.save(item);
    }

    // 2) 메인 목록
    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAllByOrderByCreatedAtDesc();
    }

    // 3) 삭제 (작성자만 가능)
    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id, HttpSession session) {
        String loginUserId = (String) session.getAttribute("LOGIN_USER_ID");
        if (loginUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 물품입니다."));

        if (!item.getOwnerUserId().equals(loginUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 삭제할 수 있습니다.");
        }

        itemRepository.delete(item);
    }
}