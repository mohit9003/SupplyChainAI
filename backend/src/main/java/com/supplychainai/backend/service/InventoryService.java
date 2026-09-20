package com.supplychainai.backend.service;

import com.supplychainai.backend.entity.Inventory;
import com.supplychainai.backend.entity.Product;
import com.supplychainai.backend.entity.Warehouse;
import com.supplychainai.backend.repository.InventoryRepository;
import com.supplychainai.backend.repository.ProductRepository;
import com.supplychainai.backend.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;

    public Inventory create(Inventory inventory) {

        Long productId = inventory.getProduct().getId();
        Long warehouseId = inventory.getWarehouse().getId();

        if (inventoryRepository
                .findByProductIdAndWarehouseId(productId, warehouseId)
                .isPresent()) {

            throw new RuntimeException(
                    "Inventory already exists for this product and warehouse"
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        inventory.setProduct(product);
        inventory.setWarehouse(warehouse);

        return inventoryRepository.save(inventory);
    }

    public List<Inventory> getAll() {
        return inventoryRepository.findAll();
    }

    public Inventory getById(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));
    }

    public Inventory update(Long id, Inventory updatedInventory) {

        Inventory inventory = getById(id);

        inventory.setQuantity(updatedInventory.getQuantity());
        inventory.setReorderLevel(updatedInventory.getReorderLevel());

        return inventoryRepository.save(inventory);
    }

    public void delete(Long id) {

        Inventory inventory = getById(id);

        inventoryRepository.delete(inventory);
    }
    public List<Inventory> getLowStockItems() {
    return inventoryRepository.findLowStockItems();
}
}