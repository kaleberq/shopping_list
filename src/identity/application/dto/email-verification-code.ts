export type EmailVerificationCode = {
  email: string;
  codeHash: string;
  expiresAt: Date;
};
