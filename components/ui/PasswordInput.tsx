"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { validatePassword } from "@/lib/validations";

interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  showStrength?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

function PasswordInput({
  className,
  showStrength = false,
  onValidationChange,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [validation, setValidation] = React.useState<{
    isValid: boolean;
    errors: string[];
    strength: "weak" | "medium" | "strong";
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (showStrength && value) {
      const result = validatePassword(value);
      setValidation(result);
      onValidationChange?.(result.isValid);
    } else {
      setValidation(null);
      onValidationChange?.(true);
    }

    props.onChange?.(e);
  };

  const getStrengthColor = () => {
    if (!validation) return "";
    switch (validation.strength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
    }
  };

  const getStrengthLabel = () => {
    if (!validation) return "";
    switch (validation.strength) {
      case "weak":
        return "Débil";
      case "medium":
        return "Media";
      case "strong":
        return "Fuerte";
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-10 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          {...props}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>

      {showStrength && validation && props.value && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  getStrengthColor()
                )}
                style={{
                  width:
                    validation.strength === "weak"
                      ? "33%"
                      : validation.strength === "medium"
                        ? "66%"
                        : "100%",
                }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {getStrengthLabel()}
            </span>
          </div>

          {validation.errors.length > 0 && (
            <ul className="text-xs text-red-600 space-y-0.5">
              {validation.errors.map((error, idx) => (
                <li key={idx}>• {error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export { PasswordInput };
