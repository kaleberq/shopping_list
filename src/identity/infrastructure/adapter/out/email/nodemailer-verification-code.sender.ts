import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { VerificationCodeSender } from '../../../../application/port/out/verification-code-sender';
import { EmailDeliveryException } from '../../../../domain/exception/identity.exceptions';

@Injectable()
export class NodemailerVerificationCodeSender extends VerificationCodeSender {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly subject: string;

  constructor(private readonly config: ConfigService) {
    super();
    const user =
      this.config.get<string>('MAIL_USER') ??
      this.config.get<string>('spring.mail.username');
    const pass =
      this.config.get<string>('MAIL_PASSWORD') ??
      this.config.get<string>('spring.mail.password');
    this.from =
      this.config.get<string>('MAIL_FROM') ??
      this.config.get<string>('app.mail.from') ??
      user ??
      '';
    this.subject =
      this.config.get<string>('MAIL_VERIFICATION_SUBJECT') ??
      'Codigo de verificacao - Shopping List';

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: Number(this.config.get<string>('MAIL_PORT', '587')),
      secure: false,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async send(email: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: this.subject,
        text: [
          'Ola,',
          '',
          'Seu codigo para concluir o cadastro no Shopping List e:',
          '',
          code,
          '',
          'Este codigo expira em alguns minutos. Se voce nao solicitou o cadastro, ignore este e-mail.',
          '',
          'Shopping List',
        ].join('\n'),
      });
    } catch (error) {
      const message =
        error instanceof Error && /auth|credential|invalid login/i.test(error.message)
          ? 'Nao foi possivel enviar o e-mail. No .env use uma senha de app do Google ' +
            '(https://myaccount.google.com/apppasswords), nao a senha normal da conta.'
          : 'Nao foi possivel enviar o e-mail. Verifique o SMTP no .env.';
      throw new EmailDeliveryException(message);
    }
  }
}
