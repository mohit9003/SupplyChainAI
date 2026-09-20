package com.supplychainai.backend.service;

import com.supplychainai.backend.dto.DashboardSummaryResponse;
import com.supplychainai.backend.repository.InventoryRepository;
import com.supplychainai.backend.repository.ProductRepository;
import com.supplychainai.backend.repository.SupplierRepository;
import com.supplychainai.backend.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;

    public DashboardSummaryResponse getSummary() {

        long totalProducts = productRepository.count();

        long totalSuppliers = supplierRepository.count();

        long totalWarehouses = warehouseRepository.count();

        long totalInventoryUnits = inventoryRepository
                .findAll()
                .stream()
                .mapToLong(inventory -> inventory.getQuantity())
                .sum();

        long lowStockItems = inventoryRepository
                .findAll()
                .stream()
                .filter(inventory ->
                        inventory.getQuantity()
                                <= inventory.getReorderLevel()
                )
                .count();

        return new DashboardSummaryResponse(
                totalProducts,
                totalSuppliers,
                totalWarehouses,
                totalInventoryUnits,
                lowStockItems
        );
    }
}