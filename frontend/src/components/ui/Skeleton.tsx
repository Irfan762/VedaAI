import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800',
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;
