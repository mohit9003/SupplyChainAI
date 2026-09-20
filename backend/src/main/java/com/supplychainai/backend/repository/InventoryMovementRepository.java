package com.supplychainai.backend.repository;

import com.supplychainai.backend.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryMovementRepository
        extends JpaRepository<InventoryMovement, Long> {

    List<InventoryMovement> findByInventoryIdOrderByCreatedAtDesc(
            Long inventoryId
    );
}