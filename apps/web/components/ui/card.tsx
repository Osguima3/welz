import { JSX } from 'preact';

export function Card(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const { class: className = '', ...rest } = props;
  return (
    <div
      class={`rounded-lg border-gray-200 border bg-card text-card-foreground shadow-sm ${className}`}
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
      class={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...rest}
    />
  );
}

export function CardDescription(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  const { class: className = '', ...rest } = props;
  return (
    <p
      class={`text-sm text-muted-foreground ${className}`}
      {...rest}
    />
  );
}

export function CardContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const { class: className = '', ...rest } = props;
  return (
    <div
      class={`p-6 pt-0 ${className}`}
      {...rest}
    />
  );
}

export function CardFooter(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const { class: className = '', ...rest } = props;
  return (
    <div
      class={`flex items-center p-6 pt-0 ${className}`}
      {...rest}
    />
  );
}
