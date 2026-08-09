export type RequestAuthCodeCommand = {
  email: string;
  purpose?: 'login' | 'register';
};
