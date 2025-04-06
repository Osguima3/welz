import { JSX } from 'preact';

interface SkeletonProps extends JSX.HTMLAttributes<HTMLDivElement> {
  class?: string;
}

export function Skeleton({ class: className = '', ...props }: SkeletonProps) {
  return (
    <div
      class={`animate-pulse rounded-md bg-muted ${className}`}
      {...props}
    />
  );
}
