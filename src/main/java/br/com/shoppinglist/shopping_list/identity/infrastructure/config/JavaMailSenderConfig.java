package br.com.shoppinglist.shopping_list.identity.infrastructure.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class JavaMailSenderConfig {

	@Bean
	@ConditionalOnMissingBean(JavaMailSender.class)
	JavaMailSender javaMailSender(Environment environment) {
		JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
		mailSender.setHost(environment.getRequiredProperty("spring.mail.host"));
		mailSender.setPort(environment.getProperty("spring.mail.port", Integer.class, 587));
		mailSender.setUsername(environment.getProperty("spring.mail.username", ""));
		mailSender.setPassword(environment.getProperty("spring.mail.password", ""));
		mailSender.getJavaMailProperties().put("mail.smtp.auth", "true");
		mailSender.getJavaMailProperties().put("mail.smtp.starttls.enable", "true");
		return mailSender;
	}
}
