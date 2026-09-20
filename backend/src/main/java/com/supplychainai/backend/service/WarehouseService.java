package com.supplychainai.backend.service;

import com.supplychainai.backend.entity.Warehouse;
import com.supplychainai.backend.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public Warehouse create(Warehouse warehouse) {

        if (warehouseRepository.existsByCode(warehouse.getCode())) {
            throw new RuntimeException("Warehouse code already exists");
        }

        return warehouseRepository.save(warehouse);
    }

    public List<Warehouse> getAll() {
        return warehouseRepository.findAll();
    }

    public Warehouse getById(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
    }

    public Warehouse update(Long id, Warehouse updatedWarehouse) {

        Warehouse warehouse = getById(id);

        warehouse.setName(updatedWarehouse.getName());
        warehouse.setLocation(updatedWarehouse.getLocation());
        warehouse.setCode(updatedWarehouse.getCode());
        warehouse.setActive(updatedWarehouse.getActive());

        return warehouseRepository.save(warehouse);
    }

    public void delete(Long id) {

        Warehouse warehouse = getById(id);

        warehouseRepository.delete(warehouse);
    }
}