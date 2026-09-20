package com.supplychainai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InventoryMovementAnalyticsResponse {

    private long totalPurchaseQuantity;
    private long totalSaleQuantity;
    private long totalReturnQuantity;
    private long totalAdjustmentQuantity;

    private long purchaseTransactions;
    private long saleTransactions;
    private long returnTransactions;
    private long adjustmentTransactions;
}