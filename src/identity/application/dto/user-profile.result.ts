export type UserProfileResult = {
  id: string;
  email: string;
  name: string;
  preferredCurrency: string;
  plan: {
    id: string;
    name: string;
  };
};
