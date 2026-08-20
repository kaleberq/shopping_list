export class EmptyItemDescriptionException extends Error {
  constructor() {
    super('Item description is required');
    this.name = 'EmptyItemDescriptionException';
  }
}
