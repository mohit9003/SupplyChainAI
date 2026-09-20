package com.supplychainai.backend.controller;

import com.supplychainai.backend.dto.LoginRequest;
import com.supplychainai.backend.dto.LoginResponse;
import com.supplychainai.backend.dto.RegisterRequest;
import com.supplychainai.backend.dto.UserResponse;
import com.supplychainai.backend.entity.User;
import com.supplychainai.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}