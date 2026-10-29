// Mirrors the registration rules in backend/middleware/validationSchemas.js so mistakes are
// caught before submit. The backend remains authoritative.

export function passwordPolicyIssues(password: string): string[] {
  const issues: string[] = [];
  if (!password) return ["Password is required."];
  if (password.length < 12) issues.push("at least 12 characters");
  if (!/[a-z]/.test(password)) issues.push("a lowercase letter");
  if (!/[A-Z]/.test(password)) issues.push("an uppercase letter");
  if (!/[0-9]/.test(password)) issues.push("a number");
  if (!/[^A-Za-z0-9\s]/.test(password)) issues.push("a symbol");
  const tooLong = new TextEncoder().encode(password).length > 72;
  const message = issues.length ? [`Password needs ${issues.join(", ")}.`] : [];
  if (tooLong) message.push("Password must not exceed 72 bytes.");
  return message;
}

export function validateRegistrationPassword(password: string): string {
  return passwordPolicyIssues(password).join(" ");
}

export function validateRegistrationName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "Full name is required.";
  if (trimmed.length > 255) return "Full name must be 255 characters or fewer.";
  return "";
}
