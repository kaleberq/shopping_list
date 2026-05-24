package br.com.shoppinglist.shopping_list.identity.infrastructure.adapter.in.web;

import br.com.shoppinglist.shopping_list.identity.domain.exception.EmailAlreadyInUseException;
import br.com.shoppinglist.shopping_list.identity.domain.exception.EmailDeliveryException;
import br.com.shoppinglist.shopping_list.identity.domain.exception.InvalidCredentialsException;
import br.com.shoppinglist.shopping_list.identity.domain.exception.InvalidVerificationCodeException;
import br.com.shoppinglist.shopping_list.identity.domain.exception.VerificationCodeExpiredException;
import br.com.shoppinglist.shopping_list.identity.infrastructure.adapter.in.web.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackageClasses = AuthController.class)
public class AuthExceptionHandler {

	@ExceptionHandler(EmailAlreadyInUseException.class)
	public ResponseEntity<ErrorResponse> handleEmailAlreadyInUse(EmailAlreadyInUseException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(ex.getMessage()));
	}

	@ExceptionHandler(InvalidCredentialsException.class)
	public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(ex.getMessage()));
	}

	@ExceptionHandler(InvalidVerificationCodeException.class)
	public ResponseEntity<ErrorResponse> handleInvalidVerificationCode(InvalidVerificationCodeException ex) {
		return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
	}

	@ExceptionHandler(VerificationCodeExpiredException.class)
	public ResponseEntity<ErrorResponse> handleVerificationCodeExpired(VerificationCodeExpiredException ex) {
		return ResponseEntity.status(HttpStatus.GONE).body(new ErrorResponse(ex.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
		return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
	}

	@ExceptionHandler(EmailDeliveryException.class)
	public ResponseEntity<ErrorResponse> handleEmailDelivery(EmailDeliveryException ex) {
		return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new ErrorResponse(ex.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
		String message = ex.getBindingResult().getFieldErrors().stream()
			.findFirst()
			.map(error -> error.getField() + ": " + error.getDefaultMessage())
			.orElse("Validation failed");
		return ResponseEntity.badRequest().body(new ErrorResponse(message));
	}
}
