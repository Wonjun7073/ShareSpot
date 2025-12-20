package com.example.repository;

import com.example.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    // 최신순으로 정렬해서 가져오기
    List<Item> findAllByOrderByCreatedAtDesc();
}