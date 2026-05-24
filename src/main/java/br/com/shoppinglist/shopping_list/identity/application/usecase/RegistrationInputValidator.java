package br.com.shoppinglist.shopping_list.identity.application.usecase;

final class RegistrationInputValidator {

	private RegistrationInputValidator() {
	}

	static String normalizeEmail(String email) {
		if (email == null) {
			return "";
		}
		return email.trim().toLowerCase();
	}

	static void validateEmail(String email) {
		if (email.isBlank() || !email.contains("@")) {
			throw new IllegalArgumentException("Invalid email");
		}
	}

	static void validate(String email, String name, String password) {
		validateEmail(email);
		if (name == null || name.isBlank()) {
			throw new IllegalArgumentException("Name is required");
		}
		if (password == null || password.length() < 8) {
			throw new IllegalArgumentException("Password must be at least 8 characters");
		}
	}
}
