package br.com.shoppinglist.shopping_list.identity.application.dto;

import java.time.Instant;

public record EmailVerificationCode(String email, String codeHash, Instant expiresAt) {
}
