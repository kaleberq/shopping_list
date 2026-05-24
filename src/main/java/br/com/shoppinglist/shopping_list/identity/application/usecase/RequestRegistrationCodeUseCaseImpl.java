package br.com.shoppinglist.shopping_list.identity.application.usecase;

import br.com.shoppinglist.shopping_list.identity.application.dto.EmailVerificationCode;
import br.com.shoppinglist.shopping_list.identity.application.dto.MessageResult;
import br.com.shoppinglist.shopping_list.identity.application.dto.RequestRegistrationCodeCommand;
import br.com.shoppinglist.shopping_list.identity.application.port.in.RequestRegistrationCodeUseCase;
import br.com.shoppinglist.shopping_list.identity.application.port.out.EmailVerificationCodeRepository;
import br.com.shoppinglist.shopping_list.identity.application.port.out.PasswordHasher;
import br.com.shoppinglist.shopping_list.identity.application.port.out.RegistrationVerificationSettings;
import br.com.shoppinglist.shopping_list.identity.application.port.out.UserRepository;
import br.com.shoppinglist.shopping_list.identity.application.port.out.VerificationCodeSender;
import br.com.shoppinglist.shopping_list.identity.domain.exception.EmailAlreadyInUseException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Service;

@Service
public class RequestRegistrationCodeUseCaseImpl implements RequestRegistrationCodeUseCase {

	private static final SecureRandom RANDOM = new SecureRandom();

	private final UserRepository userRepository;
	private final EmailVerificationCodeRepository emailVerificationCodeRepository;
	private final PasswordHasher passwordHasher;
	private final VerificationCodeSender verificationCodeSender;
	private final RegistrationVerificationSettings verificationSettings;

	public RequestRegistrationCodeUseCaseImpl(
		UserRepository userRepository,
		EmailVerificationCodeRepository emailVerificationCodeRepository,
		PasswordHasher passwordHasher,
		VerificationCodeSender verificationCodeSender,
		RegistrationVerificationSettings verificationSettings
	) {
		this.userRepository = userRepository;
		this.emailVerificationCodeRepository = emailVerificationCodeRepository;
		this.passwordHasher = passwordHasher;
		this.verificationCodeSender = verificationCodeSender;
		this.verificationSettings = verificationSettings;
	}

	@Override
	public MessageResult execute(RequestRegistrationCodeCommand command) {
		String email = RegistrationInputValidator.normalizeEmail(command.email());
		RegistrationInputValidator.validateEmail(email);

		if (userRepository.existsByEmail(email)) {
			throw new EmailAlreadyInUseException(email);
		}

		String plainCode = generateSixDigitCode();
		long expirationMinutes = Math.max(verificationSettings.codeExpirationMinutes(), 1);
		Instant expiresAt = Instant.now().plus(expirationMinutes, ChronoUnit.MINUTES);

		EmailVerificationCode verificationCode = new EmailVerificationCode(
			email,
			passwordHasher.hash(plainCode),
			expiresAt
		);
		emailVerificationCodeRepository.save(verificationCode);
		verificationCodeSender.send(email, plainCode);

		return new MessageResult("Verification code sent to your email");
	}

	private String generateSixDigitCode() {
		int value = RANDOM.nextInt(1_000_000);
		return String.format("%06d", value);
	}
}
