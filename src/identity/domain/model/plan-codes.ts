export const PLAN_CODES = {
  free: 'free',
  paid: 'paid',
} as const;

export const PLAN_CODES_LIST = ['free', 'paid'] as const;

export type PlanCode = (typeof PLAN_CODES_LIST)[number];

export function isPlanCode(value: string): value is PlanCode {
  return (PLAN_CODES_LIST as readonly string[]).includes(value);
}
