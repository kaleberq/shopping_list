package br.com.shoppinglist.shopping_list.identity.application.usecase;

import br.com.shoppinglist.shopping_list.identity.application.dto.AuthTokenResult;
import br.com.shoppinglist.shopping_list.identity.application.dto.ConfirmRegistrationCommand;
import br.com.shoppinglist.shopping_list.identity.application.dto.EmailVerificationCode;
import br.com.shoppinglist.shopping_list.identity.application.port.in.ConfirmRegistrationUseCase;
import br.com.shoppinglist.shopping_list.identity.application.port.out.EmailVerificationCodeRepository;
import br.com.shoppinglist.shopping_list.identity.application.port.out.PasswordHasher;
import br.com.shoppinglist.shopping_list.identity.application.port.out.TokenIssuer;
import br.com.shoppinglist.shopping_list.identity.application.port.out.UserRepository;
import br.com.shoppinglist.shopping_list.identity.domain.exception.EmailAlreadyInUseException;
import br.com.shoppinglist.shopping_list.identity.domain.exception.InvalidVerificationCodeException;
import br.com.shoppinglist.shopping_list.identity.domain.exception.VerificationCodeExpiredException;
import br.com.shoppinglist.shopping_list.identity.domain.model.User;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class ConfirmRegistrationUseCaseImpl implements ConfirmRegistrationUseCase {

	private final EmailVerificationCodeRepository emailVerificationCodeRepository;
	private final UserRepository userRepository;
	private final PasswordHasher passwordHasher;
	private final TokenIssuer tokenIssuer;

	public ConfirmRegistrationUseCaseImpl(
		EmailVerificationCodeRepository emailVerificationCodeRepository,
		UserRepository userRepository,
		PasswordHasher passwordHasher,
		TokenIssuer tokenIssuer
	) {
		this.emailVerificationCodeRepository = emailVerificationCodeRepository;
		this.userRepository = userRepository;
		this.passwordHasher = passwordHasher;
		this.tokenIssuer = tokenIssuer;
	}

	@Override
	public AuthTokenResult execute(ConfirmRegistrationCommand command) {
		String email = RegistrationInputValidator.normalizeEmail(command.email());
		String code = normalizeCode(command.code());
		RegistrationInputValidator.validate(email, command.name(), command.password());

		if (code.isBlank()) {
			throw new InvalidVerificationCodeException();
		}

		EmailVerificationCode verificationCode = emailVerificationCodeRepository.findByEmail(email)
			.orElseThrow(InvalidVerificationCodeException::new);

		if (verificationCode.expiresAt().isBefore(Instant.now())) {
			emailVerificationCodeRepository.deleteByEmail(email);
			throw new VerificationCodeExpiredException();
		}

		if (!passwordHasher.matches(code, verificationCode.codeHash())) {
			throw new InvalidVerificationCodeException();
		}

		if (userRepository.existsByEmail(email)) {
			emailVerificationCodeRepository.deleteByEmail(email);
			throw new EmailAlreadyInUseException(email);
		}

		String passwordHash = passwordHasher.hash(command.password());
		User user = userRepository.save(email, command.name().trim(), passwordHash);
		emailVerificationCodeRepository.deleteByEmail(email);
		return tokenIssuer.issue(user.id());
	}

	private String normalizeCode(String code) {
		if (code == null) {
			return "";
		}
		return code.trim();
	}
}
