package com.supplychainai.backend.controller;

import com.supplychainai.backend.entity.Inventory;
import com.supplychainai.backend.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Inventory create(@Valid @RequestBody Inventory inventory) {
        return inventoryService.create(inventory);
    }

    @GetMapping
    public List<Inventory> getAll() {
        return inventoryService.getAll();
    }

    @GetMapping("/{id}")
    public Inventory getById(@PathVariable Long id) {
        return inventoryService.getById(id);
    }

    @PutMapping("/{id}")
    public Inventory update(
            @PathVariable Long id,
            @Valid @RequestBody Inventory inventory) {

        return inventoryService.update(id, inventory);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        inventoryService.delete(id);
    }
    @GetMapping("/low-stock")
public List<Inventory> getLowStockItems() {
    return inventoryService.getLowStockItems(); 
}
}