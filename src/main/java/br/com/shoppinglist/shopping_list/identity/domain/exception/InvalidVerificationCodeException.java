package br.com.shoppinglist.shopping_list.identity.domain.exception;

public class InvalidVerificationCodeException extends RuntimeException {

	public InvalidVerificationCodeException() {
		super("Invalid or expired verification code");
	}
}
