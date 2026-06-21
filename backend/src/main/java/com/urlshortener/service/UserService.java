package com.urlshortener.service;

import com.urlshortener.dto.AuthResponse;
import com.urlshortener.dto.LoginRequest;
import com.urlshortener.dto.RegisterRequest;
import com.urlshortener.model.User;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    User getCurrentUser();
}
