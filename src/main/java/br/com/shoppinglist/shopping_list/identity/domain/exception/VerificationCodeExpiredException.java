package br.com.shoppinglist.shopping_list.identity.domain.exception;

public class VerificationCodeExpiredException extends RuntimeException {

	public VerificationCodeExpiredException() {
		super("Verification code has expired");
	}
}
