'use client';

import {useId} from 'react';

type Props = {
  name: string;
  defaultValue: string;
  className: string;
  rows?: number;
  label?: string;
};

export function JsonTextarea({
  name,
  defaultValue,
  className,
  rows,
  label = 'JSON'
}: Props) {
  const hintId = useId();

  return (
    <>
      <textarea
        className={className}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        aria-describedby={hintId}
        onInput={(event) => {
          const target = event.currentTarget;
          const raw = target.value.trim();

          if (!raw) {
            target.setCustomValidity('');
            return;
          }

          try {
            const parsed = JSON.parse(raw);
            const validObject = parsed && typeof parsed === 'object' && !Array.isArray(parsed);
            target.setCustomValidity(validObject ? '' : `${label} phải là một object JSON.`);
          } catch {
            target.setCustomValidity(`${label} chưa đúng cú pháp JSON.`);
          }
        }}
      />
      <span id={hintId} className="mt-1 block text-xs font-normal leading-5 text-[var(--nupsbox-slate)]">
        Phải là object JSON hợp lệ, ví dụ {"{"}"key":"value"{"}"}.
      </span>
    </>
  );
}
