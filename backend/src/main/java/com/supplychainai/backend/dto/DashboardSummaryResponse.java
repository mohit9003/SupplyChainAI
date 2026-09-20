package com.supplychainai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardSummaryResponse {

    private long totalProducts;
    private long totalSuppliers;
    private long totalWarehouses;
    private long totalInventoryUnits;
    private long lowStockItems;
}