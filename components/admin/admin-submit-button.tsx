'use client';

import {useFormStatus} from 'react';

export function AdminSubmitButton({
  idleLabel,
  pendingLabel,
  className,
  disabled = false,
  name,
  value,
  type = 'submit'
}: {
  idleLabel: string;
  pendingLabel: string;
  className: string;
  disabled?: boolean;
  name?: string;
  value?: string;
  type?: 'submit';
}) {
  const {pending} = useFormStatus();

  return (
    <button
      type={type}
      name={name}
      value={value}
      disabled={disabled || pending}
      aria-disabled={disabled || pending}
      className={className}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
