package com.example.service;

import com.example.entity.User;
import com.example.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.entity.Item;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.beans.factory.annotation.Value;
import java.io.File;
import java.io.IOException;
import java.util.Objects;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final WishlistRepository wishlistRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    public UserService(
            UserRepository userRepository,
            ItemRepository itemRepository,
            WishlistRepository wishlistRepository,
            ChatRoomRepository chatRoomRepository,
            ChatMessageRepository chatMessageRepository) {
                this.userRepository = userRepository;
                this.itemRepository = itemRepository;
                this.wishlistRepository = wishlistRepository;
                this.chatRoomRepository = chatRoomRepository;
                this.chatMessageRepository = chatMessageRepository;
            }      
        @Value("${file.upload-dir}")
        private String uploadDir; // properties의 경로 주입
      
    // =========================
    // 로그인
    // =========================
    public boolean login(String userId, String password) {
        final String uid = (userId == null) ? null : userId.trim();
        final String pw = (password == null) ? null : password.trim();

        return userRepository.findByUserId(uid)
                .map(u -> Objects.equals(u.getPassword(), pw))
                .orElse(false);
    }

    // =========================
    // 회원가입
    // =========================
    public void register(String userId, String password, String nickname) {
        userId = userId == null ? null : userId.trim();
        password = password == null ? null : password.trim();
        nickname = nickname == null ? "" : nickname.trim();

        if (userId == null || userId.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("아이디/비밀번호를 입력하세요.");
        }
        if (userRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        User u = new User(userId, password);
        u.setNickname(nickname);

        if (!nickname.isBlank()) {
            u.setProfileInitial(nickname.substring(0, 1));
        }

        userRepository.save(u);
    }

    // =========================
    // 내 정보 조회
    // =========================
    public User getMe(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("사용자 데이터가 없습니다."));
    }

    @Transactional
    // [변경] phone 대신 introduction 파라미터 추가
    public User updateMe(String userId, String nickname, String dong, String introduction, MultipartFile file) throws IOException {
        User me = getMe(userId);

        if (nickname != null && !nickname.isBlank()) {
            me.setNickname(nickname.trim());
            me.setProfileInitial(nickname.trim().substring(0, 1));
        }
        if (dong != null && !dong.isBlank()) me.setDong(dong.trim());
        
        // [삭제] phone 관련 로직 제거
        // if (phone != null && !phone.isBlank()) me.setPhone(phone.trim());

        // [추가] 자기소개 저장 로직
        if (introduction != null) {
            me.setIntroduction(introduction);
        }

        // 프로필 이미지 로직 (기존 유지)
        if (file != null && !file.isEmpty()) {
            String uploadPath = "C:/uploads/profile/";
            
            File dir = new File(uploadPath);
            if (!dir.exists()) dir.mkdirs();

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            File dest = new File(uploadPath + fileName);
            file.transferTo(dest);

            me.setProfileImageUrl("/uploads/profile/" + fileName);
        }
        
        return userRepository.save(me);
    }
    

    @Transactional
    public void changePassword(String userId, String currentPw, String newPw) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!Objects.equals(user.getPassword(), currentPw)) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        if (newPw == null || newPw.isBlank()) {
            throw new IllegalArgumentException("새 비밀번호를 입력하세요.");
        }

        user.setPassword(newPw);
        userRepository.save(user);
    }   
    // =========================
    // 🔥 회원 탈퇴 (연관 데이터 전부 삭제)
    // =========================
    @Transactional
    public void withdrawWithRelated(String userId) {
        String uid = (userId == null) ? null : userId.trim();
        if (uid == null || uid.isBlank()) {
            throw new IllegalArgumentException("유효하지 않은 사용자입니다.");
        }

        User me = getMe(uid);

        // 1) 내가 찜한 목록 삭제
        wishlistRepository.deleteByUserId(uid);

        // 2) 내가 올린 아이템(글) 목록 먼저 조회
        var myItems = itemRepository.findByOwnerUserId(uid);
        var myItemIds = myItems.stream().map(Item::getId).toList();

        // 3) 내 아이템에 달린 찜(다른 사람 찜 포함) 먼저 삭제 (FK 방지)
        if (!myItemIds.isEmpty()) {
            wishlistRepository.deleteByItem_IdIn(myItemIds);
        }

        // 4) 채팅 메시지 -> 채팅방 삭제
        var rooms = chatRoomRepository.findByBuyerUserIdOrSellerUserId(uid, uid);
        for (var room : rooms) {
            chatMessageRepository.deleteByRoomId(room.getId());
        }
        chatRoomRepository.deleteByBuyerUserIdOrSellerUserId(uid, uid);

        // 5) 내 아이템 삭제
        itemRepository.deleteByOwnerUserId(uid);

        // 6) 마지막으로 유저 삭제
        userRepository.delete(me);
    }
}
