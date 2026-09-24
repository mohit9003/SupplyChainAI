package com.supplychainai.backend.repository;

import com.supplychainai.backend.entity.InventoryMovement;
import com.supplychainai.backend.entity.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
    long getTotalQuantityByType(
            @Param("type") MovementType type
    );

    // Get all movements with product and warehouse details
    @Query("""
            SELECT m
            FROM InventoryMovement m
            JOIN FETCH m.inventory i
            JOIN FETCH i.product p
            JOIN FETCH i.warehouse w
            ORDER BY m.createdAt DESC
            """)
    List<InventoryMovement> findAllWithDetails();

    // Get sales history for demand forecasting
    @Query("""
            SELECT m
            FROM InventoryMovement m
            JOIN FETCH m.inventory i
            JOIN FETCH i.product p
            JOIN FETCH i.warehouse w
            WHERE m.type = :type
            ORDER BY m.createdAt ASC
            """)
    List<InventoryMovement> findByMovementTypeWithDetails(
            @Param("type") MovementType type
    );
}