'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', disabled, ...props }, ref) => {
    const baseStyles =
      'w-5 h-5 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';

    const stateStyles = error
      ? 'border-error focus:ring-error text-error'
      : 'border-border focus:ring-primary text-primary checked:border-primary';

    const disabledStyles = disabled
      ? 'opacity-60 cursor-not-allowed'
      : 'hover:border-primary';

    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className} mt-0.5`}
            {...props}
          />

          {label && (
            <label
              className={`text-sm text-foreground flex-1 ${
                disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {label}
            </label>
          )}
        </div>

        {error && (
          <p className="mt-1.5 ml-8 text-sm text-error flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 ml-8 text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
