package com.supplychainai.backend.service;

import com.supplychainai.backend.entity.Supplier;
import com.supplychainai.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public Supplier create(Supplier supplier) {

        if (supplierRepository.existsByEmail(supplier.getEmail())) {
            throw new RuntimeException("Supplier email already exists");
        }

        return supplierRepository.save(supplier);
    }

    public List<Supplier> getAll() {
        return supplierRepository.findAll();
    }

    public Supplier getById(Long id) {

        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    public Supplier update(Long id, Supplier updatedSupplier) {

        Supplier supplier = getById(id);

        supplier.setName(updatedSupplier.getName());
        supplier.setEmail(updatedSupplier.getEmail());
        supplier.setPhone(updatedSupplier.getPhone());
        supplier.setAddress(updatedSupplier.getAddress());
        supplier.setActive(updatedSupplier.getActive());

        return supplierRepository.save(supplier);
    }

    public void delete(Long id) {

        Supplier supplier = getById(id);

        supplierRepository.delete(supplier);
    }
}