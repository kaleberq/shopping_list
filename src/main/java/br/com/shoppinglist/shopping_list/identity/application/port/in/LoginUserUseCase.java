package br.com.shoppinglist.shopping_list.identity.application.port.in;

import br.com.shoppinglist.shopping_list.identity.application.dto.AuthTokenResult;
import br.com.shoppinglist.shopping_list.identity.application.dto.LoginUserCommand;

public interface LoginUserUseCase {

	AuthTokenResult execute(LoginUserCommand command);
}
