export type UserProfileResult = {
  id: string;
  email: string;
  name: string;
  preferredCurrency: string;
  plan: {
    code: string;
    name: string;
  };
};
