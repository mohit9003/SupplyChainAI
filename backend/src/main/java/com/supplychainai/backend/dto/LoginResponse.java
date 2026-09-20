package com.supplychainai.backend.dto;

import com.supplychainai.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private Long id;
    private String name;
    private String email;
    private Role role;
}