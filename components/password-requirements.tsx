import type { PasswordCheck } from "@/lib/password";

const rules: { key: keyof PasswordCheck; label: string }[] = [
  { key: "minLength", label: "At least 8 characters" },
  { key: "hasUpper", label: "One uppercase letter (A-Z)" },
  { key: "hasLower", label: "One lowercase letter (a-z)" },
  { key: "hasDigit", label: "One digit (0-9)" },
  { key: "hasSpecial", label: "One special character (!@#$%...)" },
];

export function PasswordRequirements({ check }: { check: PasswordCheck }) {
  return (
    <ul className="space-y-1 text-xs">
      {rules.map((rule) => {
        const passed = check[rule.key];
        return (
          <li
            key={rule.key}
            className={passed ? "text-green-400" : "text-muted-foreground"}
          >
            {passed ? "✓" : "○"} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}