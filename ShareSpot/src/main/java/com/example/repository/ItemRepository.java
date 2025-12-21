package com.example.repository;

import com.example.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findAllByOrderByCreatedAtDesc();

    List<Item> findByOwnerUserId(String ownerUserId);

    long deleteByOwnerUserId(String ownerUserId);
}