package com.supplychainai.backend.controller;

import com.supplychainai.backend.dto.AddPurchaseOrderItemRequest;
import com.supplychainai.backend.dto.CreatePurchaseOrderRequest;
import com.supplychainai.backend.entity.PurchaseOrder;
import com.supplychainai.backend.entity.PurchaseOrderItem;
import com.supplychainai.backend.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseOrder create(
            @Valid @RequestBody CreatePurchaseOrderRequest request
    ) {

        return purchaseOrderService.createPurchaseOrder(
                request.getPoNumber(),
                request.getSupplierId(),
                request.getWarehouseId()
        );
    }

    @GetMapping
    public List<PurchaseOrder> getAll() {
        return purchaseOrderService.getAll();
    }

    @GetMapping("/{id}")
    public PurchaseOrder getById(@PathVariable Long id) {
        return purchaseOrderService.getById(id);
    }

    @PostMapping("/{id}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseOrderItem addItem(
            @PathVariable Long id,
            @Valid @RequestBody AddPurchaseOrderItemRequest request
    ) {

        return purchaseOrderService.addItem(
                id,
                request.getProductId(),
                request.getQuantity(),
                request.getUnitPrice()
        );
    }

    @GetMapping("/{id}/items")
    public List<PurchaseOrderItem> getItems(
            @PathVariable Long id
    ) {

        return purchaseOrderService.getItems(id);
    }
    @PutMapping("/{id}/approve")
public PurchaseOrder approve(@PathVariable Long id) {

    return purchaseOrderService.approve(id);
}
@PutMapping("/{id}/receive")
public PurchaseOrder receive(@PathVariable Long id) {

    return purchaseOrderService.receive(id);
}
}