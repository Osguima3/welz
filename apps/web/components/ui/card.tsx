import { JSX } from 'preact';

export function Card(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const { class: className = '', ...rest } = props;
  return (
    <div
      class={`rounded-lg border bg-card text-card-foreground shadow-sm border-primary/10 overflow-hidden ${className}`}
      {...rest}
    />
  );
}

export function CardHeader(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const { class: className = '', ...rest } = props;
  return (
    <div
      class={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...rest}
    />
  );
}

export function CardTitle(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const { class: className = '', ...rest } = props;
  return (
    <h3
      class={`leading-none tracking-tight text-lg font-medium flex items-center ${className}`}
      {...rest}
    />
  );
}

export function CardContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const { class: className = 'p-6', ...rest } = props;
  return (
    <div
      class={className}
      {...rest}
    />
  );
}
