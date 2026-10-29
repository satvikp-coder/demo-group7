// Validation for the Budget Planner's "Simulate Target Budget Cap" input (whole rupees, 0 to the field maximum).
export const MAX_SIMULATED_BUDGET = 100000;

/** `value` is the accepted amount, or null with a `message` explaining why the text was rejected. */
export interface BudgetCapResult { value: number | null; message: string }

export function parseBudgetCap(text: string, max: number = MAX_SIMULATED_BUDGET): BudgetCapResult {
  const trimmed = text.trim();
  if (!trimmed) return { value: null, message: "Enter a budget amount." };
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { value: null, message: "Enter a valid number." };
  if (value < 0) return { value: null, message: "Budget cannot be negative." };
  if (value > max) return { value: null, message: `Budget cannot exceed ₹${max.toLocaleString("en-IN")}.` };
  return { value: Math.round(value), message: "" };
}
