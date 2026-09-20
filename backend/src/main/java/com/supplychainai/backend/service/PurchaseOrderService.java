package com.supplychainai.backend.service;

import com.supplychainai.backend.entity.*;
import com.supplychainai.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;

    @Transactional
    public PurchaseOrder createPurchaseOrder(
            String poNumber,
            Long supplierId,
            Long warehouseId
    ) {

        if (purchaseOrderRepository.existsByPoNumber(poNumber)) {
            throw new RuntimeException("PO number already exists");
        }

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        return purchaseOrderRepository.save(
                PurchaseOrder.builder()
                        .poNumber(poNumber)
                        .supplier(supplier)
                        .warehouse(warehouse)
                        .status(PurchaseOrderStatus.DRAFT)
                        .totalAmount(BigDecimal.ZERO)
                        .build()
        );
    }

    public List<PurchaseOrder> getAll() {
        return purchaseOrderRepository.findAll();
    }

    public PurchaseOrder getById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Purchase order not found"));
    }

    @Transactional
    public PurchaseOrderItem addItem(
            Long purchaseOrderId,
            Long productId,
            Integer quantity,
            BigDecimal unitPrice
    ) {

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }

        if (unitPrice == null ||
                unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Unit price must be greater than zero");
        }

        PurchaseOrder purchaseOrder = getById(purchaseOrderId);

        if (purchaseOrder.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new RuntimeException(
                    "Items can only be added to a DRAFT purchase order"
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        BigDecimal totalPrice =
                unitPrice.multiply(BigDecimal.valueOf(quantity));

        PurchaseOrderItem item = PurchaseOrderItem.builder()
                .purchaseOrder(purchaseOrder)
                .product(product)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .build();

        PurchaseOrderItem savedItem =
                purchaseOrderItemRepository.save(item);

        purchaseOrder.setTotalAmount(
                purchaseOrder.getTotalAmount().add(totalPrice)
        );

        purchaseOrderRepository.save(purchaseOrder);

        return savedItem;
    }

    public List<PurchaseOrderItem> getItems(Long purchaseOrderId) {

        getById(purchaseOrderId);

        return purchaseOrderItemRepository
                .findByPurchaseOrderId(purchaseOrderId);
    }

    @Transactional
    public PurchaseOrder approve(Long id) {

        PurchaseOrder purchaseOrder = getById(id);

        if (purchaseOrder.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new RuntimeException(
                    "Only DRAFT purchase orders can be approved"
            );
        }

        List<PurchaseOrderItem> items =
                purchaseOrderItemRepository.findByPurchaseOrderId(id);

        if (items.isEmpty()) {
            throw new RuntimeException(
                    "Cannot approve purchase order without items"
            );
        }

        purchaseOrder.setStatus(PurchaseOrderStatus.APPROVED);

        return purchaseOrderRepository.save(purchaseOrder);
    }

    @Transactional
    public PurchaseOrder receive(Long id) {

        PurchaseOrder purchaseOrder = getById(id);

        if (purchaseOrder.getStatus() != PurchaseOrderStatus.APPROVED) {
            throw new RuntimeException(
                    "Only APPROVED purchase orders can be received"
            );
        }

        List<PurchaseOrderItem> items =
                purchaseOrderItemRepository.findByPurchaseOrderId(id);

        if (items.isEmpty()) {
            throw new RuntimeException(
                    "Cannot receive purchase order without items"
            );
        }

        for (PurchaseOrderItem item : items) {

            Long productId = item.getProduct().getId();
            Long warehouseId = purchaseOrder.getWarehouse().getId();

            Inventory inventory = inventoryRepository
                    .findByProductIdAndWarehouseId(
                            productId,
                            warehouseId
                    )
                    .orElseThrow(() -> new RuntimeException(
                            "Inventory not found for product "
                                    + productId
                    ));

            inventory.setQuantity(
                    inventory.getQuantity() + item.getQuantity()
            );

            inventoryRepository.save(inventory);

            InventoryMovement movement =
                    InventoryMovement.builder()
                            .inventory(inventory)
                            .type(MovementType.PURCHASE)
                            .quantity(item.getQuantity())
                            .reference(purchaseOrder.getPoNumber())
                            .build();

            inventoryMovementRepository.save(movement);
        }

        purchaseOrder.setStatus(PurchaseOrderStatus.RECEIVED);

        return purchaseOrderRepository.save(purchaseOrder);
    }
}