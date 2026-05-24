package br.com.shoppinglist.shopping_list.identity.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.verification")
public record VerificationProperties(long codeExpirationMinutes) {
}
