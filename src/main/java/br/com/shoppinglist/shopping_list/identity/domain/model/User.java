package br.com.shoppinglist.shopping_list.identity.domain.model;

import java.time.Instant;

public record User(
	Long id,
	String email,
	String name,
	Instant createdAt,
	Instant updatedAt
) {
}
