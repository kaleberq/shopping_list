package br.com.shoppinglist.shopping_list.identity.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RequestRegistrationCodeRequest(@NotBlank @Email String email) {
}
