package br.com.shoppinglist.shopping_list.identity.domain.exception;

public class EmailDeliveryException extends RuntimeException {

	public EmailDeliveryException(String message, Throwable cause) {
		super(message, cause);
	}
}
