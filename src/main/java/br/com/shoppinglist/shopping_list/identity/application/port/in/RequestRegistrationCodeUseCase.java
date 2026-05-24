package br.com.shoppinglist.shopping_list.identity.application.port.in;

import br.com.shoppinglist.shopping_list.identity.application.dto.MessageResult;
import br.com.shoppinglist.shopping_list.identity.application.dto.RequestRegistrationCodeCommand;

public interface RequestRegistrationCodeUseCase {

	MessageResult execute(RequestRegistrationCodeCommand command);
}
