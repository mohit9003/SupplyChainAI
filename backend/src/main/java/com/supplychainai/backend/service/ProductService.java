package com.supplychainai.backend.service;

import com.supplychainai.backend.entity.Category;
import com.supplychainai.backend.entity.Product;
import com.supplychainai.backend.repository.CategoryRepository;
import com.supplychainai.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Product create(Product product) {

        if (productRepository.existsBySku(product.getSku())) {
            throw new RuntimeException("SKU already exists");
        }

        Long categoryId = product.getCategory().getId();

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setCategory(category);

        return productRepository.save(product);
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product update(Long id, Product updatedProduct) {

        Product product = getById(id);

        product.setName(updatedProduct.getName());
        product.setSku(updatedProduct.getSku());
        product.setDescription(updatedProduct.getDescription());
        product.setPrice(updatedProduct.getPrice());
        product.setActive(updatedProduct.getActive());

        Long categoryId = updatedProduct.getCategory().getId();

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setCategory(category);

        return productRepository.save(product);
    }

    public void delete(Long id) {

        Product product = getById(id);

        productRepository.delete(product);
    }
}