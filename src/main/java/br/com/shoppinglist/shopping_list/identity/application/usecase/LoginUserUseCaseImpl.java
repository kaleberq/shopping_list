package br.com.shoppinglist.shopping_list.identity.application.usecase;

import br.com.shoppinglist.shopping_list.identity.application.dto.AuthTokenResult;
import br.com.shoppinglist.shopping_list.identity.application.dto.LoginUserCommand;
import br.com.shoppinglist.shopping_list.identity.application.port.in.LoginUserUseCase;
import br.com.shoppinglist.shopping_list.identity.application.port.out.TokenIssuer;
import br.com.shoppinglist.shopping_list.identity.application.port.out.UserRepository;
import br.com.shoppinglist.shopping_list.identity.domain.exception.InvalidCredentialsException;
import br.com.shoppinglist.shopping_list.identity.domain.model.User;
import org.springframework.stereotype.Service;

@Service
public class LoginUserUseCaseImpl implements LoginUserUseCase {

	private final UserRepository userRepository;
	private final TokenIssuer tokenIssuer;

	public LoginUserUseCaseImpl(UserRepository userRepository, TokenIssuer tokenIssuer) {
		this.userRepository = userRepository;
		this.tokenIssuer = tokenIssuer;
	}

	@Override
	public AuthTokenResult execute(LoginUserCommand command) {
		String email = normalizeEmail(command.email());
		if (email.isBlank() || command.password() == null || command.password().isBlank()) {
			throw new InvalidCredentialsException();
		}

		User user = userRepository.authenticate(email, command.password())
			.orElseThrow(InvalidCredentialsException::new);

		return tokenIssuer.issue(user.id());
	}

	private String normalizeEmail(String email) {
		if (email == null) {
			return "";
		}
		return email.trim().toLowerCase();
	}
}
