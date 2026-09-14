import type {HTMLAttributes} from 'react';
import clsx from 'clsx';

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({className, ...props}: ContainerProps) {
  return (
    <div
      className={clsx('mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10', className)}
      {...props}
    />
  );
}
