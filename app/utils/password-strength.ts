/**
 * Same rules as Privacy & Security → Change password.
 */
export type PasswordRequirement = { label: string; met: boolean };

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "Uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Number (0-9)", met: /[0-9]/.test(password) },
    {
      label: "Special character (!@#$...)",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export function isPasswordStrong(password: string): boolean {
  const reqs = getPasswordRequirements(password);
  return reqs.every((r) => r.met);
}

export function passwordStrengthMeta(password: string) {
  const requirements = getPasswordRequirements(password);
  const metCount = requirements.filter((r) => r.met).length;
  const isStrong = metCount === requirements.length;
  const strengthLabel =
    metCount <= 2 ? "Weak" : metCount <= 4 ? "Medium" : "Strong";
  const barColor =
    metCount === 0
      ? "bg-neutral-200"
      : metCount <= 2
        ? "bg-red-500"
        : metCount <= 4
          ? "bg-yellow-500"
          : "bg-green-500";
  return {
    requirements,
    metCount,
    total: requirements.length,
    isStrong,
    strengthLabel,
    barColor,
  };
}
