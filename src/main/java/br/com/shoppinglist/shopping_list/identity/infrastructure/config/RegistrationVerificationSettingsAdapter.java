package br.com.shoppinglist.shopping_list.identity.infrastructure.config;

import br.com.shoppinglist.shopping_list.identity.application.port.out.RegistrationVerificationSettings;
import org.springframework.stereotype.Component;

@Component
public class RegistrationVerificationSettingsAdapter implements RegistrationVerificationSettings {

	private final VerificationProperties verificationProperties;

	public RegistrationVerificationSettingsAdapter(VerificationProperties verificationProperties) {
		this.verificationProperties = verificationProperties;
	}

	@Override
	public long codeExpirationMinutes() {
		return verificationProperties.codeExpirationMinutes();
	}
}
