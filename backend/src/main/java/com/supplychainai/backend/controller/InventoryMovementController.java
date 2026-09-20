package com.supplychainai.backend.controller;

import com.supplychainai.backend.entity.InventoryMovement;
import com.supplychainai.backend.service.InventoryMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory-movements")
@RequiredArgsConstructor
public class InventoryMovementController {

    private final InventoryMovementService movementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InventoryMovement create(
            @RequestBody InventoryMovement movement) {

        return movementService.create(movement);
    }

    @GetMapping("/inventory/{inventoryId}")
    public List<InventoryMovement> getByInventory(
            @PathVariable Long inventoryId) {

        return movementService.getByInventory(inventoryId);
    }
}