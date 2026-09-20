package com.supplychainai.backend.service;

import com.supplychainai.backend.entity.*;
import com.supplychainai.backend.repository.InventoryMovementRepository;
import com.supplychainai.backend.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}