export type AddListItemCommand = {
  listId: string;
  itemId?: string | null;
  description?: string | null;
  price?: number | null;
  expiry?: string | null;
};
