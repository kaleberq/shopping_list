package br.com.shoppinglist.shopping_list.identity.application.dto;

public record AuthTokenResult(String accessToken, String tokenType, long expiresInSeconds) {
}
