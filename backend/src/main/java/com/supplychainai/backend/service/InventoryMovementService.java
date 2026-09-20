package com.supplychainai.backend.service;

import com.supplychainai.backend.entity.*;
import com.supplychainai.backend.repository.InventoryMovementRepository;
import com.supplychainai.backend.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.supplychainai.backend.dto.InventoryMovementAnalyticsResponse;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryMovementService {

    private final InventoryMovementRepository movementRepository;
    private final InventoryRepository inventoryRepository;

    public InventoryMovement create(InventoryMovement movement) {

        Long inventoryId = movement.getInventory().getId();

        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        int quantity = movement.getQuantity();

        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }

        if (movement.getType() == MovementType.SALE) {

            if (inventory.getQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock");
            }

            inventory.setQuantity(
                    inventory.getQuantity() - quantity
            );

        } else if (
                movement.getType() == MovementType.PURCHASE ||
                movement.getType() == MovementType.RETURN
        ) {

            inventory.setQuantity(
                    inventory.getQuantity() + quantity
            );

        } else if (movement.getType() == MovementType.ADJUSTMENT) {

            inventory.setQuantity(quantity);
        }

        movement.setInventory(inventory);

        inventoryRepository.save(inventory);

        return movementRepository.save(movement);
    }

    public List<InventoryMovement> getByInventory(Long inventoryId) {

        return movementRepository
                .findByInventoryIdOrderByCreatedAtDesc(inventoryId);
    }
    public InventoryMovementAnalyticsResponse getAnalytics() {

    long totalPurchaseQuantity =
            movementRepository.getTotalQuantityByType(
                    MovementType.PURCHASE
            );

    long totalSaleQuantity =
            movementRepository.getTotalQuantityByType(
                    MovementType.SALE
            );

    long totalReturnQuantity =
            movementRepository.getTotalQuantityByType(
                    MovementType.RETURN
            );

    long totalAdjustmentQuantity =
            movementRepository.getTotalQuantityByType(
                    MovementType.ADJUSTMENT
            );

    long purchaseTransactions =
            movementRepository.countByType(
                    MovementType.PURCHASE
            );

    long saleTransactions =
            movementRepository.countByType(
                    MovementType.SALE
            );

    long returnTransactions =
            movementRepository.countByType(
                    MovementType.RETURN
            );

    long adjustmentTransactions =
            movementRepository.countByType(
                    MovementType.ADJUSTMENT
            );

    return new InventoryMovementAnalyticsResponse(
            totalPurchaseQuantity,
            totalSaleQuantity,
            totalReturnQuantity,
            totalAdjustmentQuantity,
            purchaseTransactions,
            saleTransactions,
            returnTransactions,
            adjustmentTransactions
    );
}
public List<InventoryMovement> getAllMovements() {
    return movementRepository.findAllWithDetails();
}
}