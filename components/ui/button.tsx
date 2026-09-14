import type {ButtonHTMLAttributes} from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'md' | 'lg';

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  className
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return clsx(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    size === 'lg' ? 'min-h-12 px-6 text-base' : 'min-h-10 px-5 text-sm',
    variant === 'primary' &&
      'bg-[var(--nupsbox-yellow)] text-[var(--nupsbox-navy)] hover:bg-[var(--nupsbox-yellow-warm)]',
    variant === 'secondary' &&
      'border border-[var(--nupsbox-border)] bg-white text-[var(--nupsbox-navy)] hover:border-[var(--nupsbox-blue)] hover:text-[var(--nupsbox-blue)]',
    variant === 'ghost' &&
      'bg-transparent text-current hover:bg-black/5',
    className
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({className, variant, size, type = 'button', ...props}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({variant, size, className})}
      {...props}
    />
  );
}
