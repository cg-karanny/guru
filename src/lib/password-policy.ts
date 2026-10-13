export const PASSWORD_POLICY_HELP_TEXT =
  'Use at least 8 characters with uppercase, lowercase, number, and special character.';

export const PASSWORD_POLICY_RULES = [
  {
    test: (password: string) => password.length >= 8,
    message: 'at least 8 characters',
    label: '8 or more characters',
  },
  {
    test: (password: string) => /[A-Z]/.test(password),
    message: 'one uppercase letter',
    label: 'Uppercase letter',
  },
  {
    test: (password: string) => /[a-z]/.test(password),
    message: 'one lowercase letter',
    label: 'Lowercase letter',
  },
  {
    test: (password: string) => /\d/.test(password),
    message: 'one number',
    label: 'Number',
  },
  {
    test: (password: string) => /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/.test(password),
    message: 'one special character',
    label: 'Special character',
  },
];

export function getPasswordPolicyError(password: string) {
  const missingRules = PASSWORD_POLICY_RULES
    .filter(rule => !rule.test(password))
    .map(rule => rule.message);

  if (missingRules.length === 0) return null;

  return `Password must include ${missingRules.join(', ')}.`;
}

export function getPasswordPolicyStatus(password: string) {
  return PASSWORD_POLICY_RULES.map(rule => ({
    label: rule.label,
    isMet: rule.test(password),
  }));
}
