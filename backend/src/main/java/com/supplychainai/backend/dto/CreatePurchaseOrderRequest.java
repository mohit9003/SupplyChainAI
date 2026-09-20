package com.supplychainai.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePurchaseOrderRequest {

    @NotBlank
    private String poNumber;

    @NotNull
    private Long supplierId;

    @NotNull
    private Long warehouseId;
}