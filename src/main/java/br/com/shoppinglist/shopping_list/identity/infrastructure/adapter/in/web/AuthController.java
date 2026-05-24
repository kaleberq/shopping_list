package br.com.shoppinglist.shopping_list.identity.infrastructure.adapter.in.web;

import br.com.shoppinglist.shopping_list.identity.application.dto.AuthTokenResult;
import br.com.shoppinglist.shopping_list.identity.application.dto.ConfirmRegistrationCommand;
import br.com.shoppinglist.shopping_list.identity.application.dto.LoginUserCommand;
import br.com.shoppinglist.shopping_list.identity.application.dto.RequestRegistrationCodeCommand;
import br.com.shoppinglist.shopping_list.identity.application.port.in.ConfirmRegistrationUseCase;
import br.com.shoppinglist.shopping_list.identity.application.port.in.LoginUserUseCase;
import br.com.shoppinglist.shopping_list.identity.application.port.in.RequestRegistrationCodeUseCase;
import br.com.shoppinglist.shopping_list.identity.infrastructure.adapter.in.web.dto.AuthResponse;
import br.com.shoppinglist.shopping_list.identity.infrastructure.adapter.in.web.dto.ConfirmRegistrationRequest;
import br.com.shoppinglist.shopping_list.identity.infrastructure.adapter.in.web.dto.LoginRequest;
import br.com.shoppinglist.shopping_list.identity.infrastructure.adapter.in.web.dto.MessageResponse;
import br.com.shoppinglist.shopping_list.identity.infrastructure.adapter.in.web.dto.RequestRegistrationCodeRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final RequestRegistrationCodeUseCase requestRegistrationCodeUseCase;
	private final ConfirmRegistrationUseCase confirmRegistrationUseCase;
	private final LoginUserUseCase loginUserUseCase;

	public AuthController(
		RequestRegistrationCodeUseCase requestRegistrationCodeUseCase,
		ConfirmRegistrationUseCase confirmRegistrationUseCase,
		LoginUserUseCase loginUserUseCase
	) {
		this.requestRegistrationCodeUseCase = requestRegistrationCodeUseCase;
		this.confirmRegistrationUseCase = confirmRegistrationUseCase;
		this.loginUserUseCase = loginUserUseCase;
	}

	@PostMapping("/register/request-code")
	@ResponseStatus(HttpStatus.ACCEPTED)
	public MessageResponse requestRegistrationCode(@Valid @RequestBody RequestRegistrationCodeRequest request) {
		var result = requestRegistrationCodeUseCase.execute(new RequestRegistrationCodeCommand(request.email()));
		return new MessageResponse(result.message());
	}

	@PostMapping("/register/confirm")
	@ResponseStatus(HttpStatus.CREATED)
	public AuthResponse confirmRegistration(@Valid @RequestBody ConfirmRegistrationRequest request) {
		AuthTokenResult result = confirmRegistrationUseCase.execute(
			new ConfirmRegistrationCommand(
				request.email(),
				request.code(),
				request.name(),
				request.password()
			)
		);
		return toResponse(result);
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest request) {
		AuthTokenResult result = loginUserUseCase.execute(
			new LoginUserCommand(request.email(), request.password())
		);
		return toResponse(result);
	}

	private AuthResponse toResponse(AuthTokenResult result) {
		return new AuthResponse(result.accessToken(), result.tokenType(), result.expiresInSeconds());
	}
}
