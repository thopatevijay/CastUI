"use client";

import React from "react";
import { cn } from "../../ui";

export interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className={cn("inline-flex items-center gap-2", className)}>
        <input
          ref={ref}
          type="checkbox"
          className="h-5 w-5 rounded border border-gray-300 accent-blue-600"
          {...props}
        />
      </label>
    );
  }
);
Toggle.displayName = "Toggle";

