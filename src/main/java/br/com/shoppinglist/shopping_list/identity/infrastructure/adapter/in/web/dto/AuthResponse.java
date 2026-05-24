package br.com.shoppinglist.shopping_list.identity.infrastructure.adapter.in.web.dto;

public record AuthResponse(String accessToken, String tokenType, long expiresIn) {
}
