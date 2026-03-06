import * as React from 'react';
import { cn } from '@/lib/cn';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-fd-muted-foreground focus-visible:outline-none focus-visible:border-fd-ring focus-visible:ring-fd-ring/50 focus-visible:ring-[3px] aria-invalid:ring-fd-destructive/20 aria-invalid:border-fd-destructive disabled:cursor-not-allowed disabled:opacity-50 transition-[color,box-shadow]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
