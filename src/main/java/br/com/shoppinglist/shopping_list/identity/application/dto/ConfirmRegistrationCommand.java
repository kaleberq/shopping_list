package br.com.shoppinglist.shopping_list.identity.application.dto;

public record ConfirmRegistrationCommand(String email, String code, String name, String password) {
}
