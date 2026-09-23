'use client';

import {useFormStatus} from 'react-dom';
import {useAdminMutationPending} from '@/components/admin/admin-mutation-form';

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
  const {pending: nativePending} = useFormStatus();
  const manualPending = useAdminMutationPending();
  const pending = nativePending || manualPending;

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
