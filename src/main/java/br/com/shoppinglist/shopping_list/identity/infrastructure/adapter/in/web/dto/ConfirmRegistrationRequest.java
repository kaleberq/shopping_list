package br.com.shoppinglist.shopping_list.identity.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ConfirmRegistrationRequest(
	@NotBlank @Email String email,
	@NotBlank @Pattern(regexp = "\\d{6}") String code,
	@NotBlank @Size(max = 255) String name,
	@NotBlank @Size(min = 8, max = 128) String password
) {
}
