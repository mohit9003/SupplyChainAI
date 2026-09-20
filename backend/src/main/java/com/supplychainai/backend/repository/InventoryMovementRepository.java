package com.supplychainai.backend.repository;

import com.supplychainai.backend.entity.InventoryMovement;
import com.supplychainai.backend.entity.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InventoryMovementRepository
        extends JpaRepository<InventoryMovement, Long> {

    List<InventoryMovement> findByInventoryIdOrderByCreatedAtDesc(
            Long inventoryId
    );

    long countByType(MovementType type);

    @Query("""
            SELECT COALESCE(SUM(m.quantity), 0)
            FROM InventoryMovement m
            WHERE m.type = :type
            """)
    long getTotalQuantityByType(MovementType type);
    @Query("""
        SELECT m
        FROM InventoryMovement m
        JOIN FETCH m.inventory i
        JOIN FETCH i.product p
        JOIN FETCH i.warehouse w
        ORDER BY m.createdAt DESC
        """)
List<InventoryMovement> findAllWithDetails();
}