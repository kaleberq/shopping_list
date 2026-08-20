export enum PlanId {
  Free = '1',
  Premium = '2',
}

export const DEFAULT_PLANS = [
  { id: PlanId.Free, name: 'Free' },
  { id: PlanId.Premium, name: 'Premium' },
] as const;

export function isPlanId(value: string): value is PlanId {
  return (Object.values(PlanId) as string[]).includes(value);
}
