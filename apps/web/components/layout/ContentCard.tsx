import { LucideIcon } from 'lucide';
import { JSX } from 'preact';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { UIColor } from '@shared/schema/Color.ts';

interface ContentCardProps {
  icon: LucideIcon;
  title: string;
  children: JSX.Element | JSX.Element[];
  color?: UIColor;
  iconColor?: UIColor;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

function getBgGradientClass(color: UIColor): string {
  const gradientMap: Record<UIColor, string> = {
    clear: '',
    muted: 'bg-muted/30',
    primary: 'bg-gradient-to-br from-primary/5 to-primary/10',
    secondary: 'bg-gradient-to-br from-secondary/5 to-secondary/10',
    destructive: 'bg-gradient-to-br from-destructive/5 to-destructive/10',
    success: 'bg-gradient-to-br from-success/5 to-success/10',
  };

  return gradientMap[color];
}

function getIconColorClass(color: UIColor): string {
  const iconColorMap: Record<UIColor, string> = {
    clear: 'text-primary',
    muted: 'text-primary',
    primary: 'text-primary',
    secondary: 'text-secondary',
    destructive: 'text-destructive',
    success: 'text-success',
  };

  return iconColorMap[color];
}

export function ContentCard({
  icon: Icon,
  title,
  children,
  color = 'clear',
  iconColor: iconColor = color,
  className = '',
  headerClassName = '',
  contentClassName = 'pt-0 p-6',
}: ContentCardProps) {
  const backgroundClass = getBgGradientClass(color);
  const iconClass = getIconColorClass(iconColor);

  return (
    <Card class={className}>
      <CardHeader class={`${backgroundClass} ${headerClassName}`}>
        <CardTitle>
          <Icon class={`h-5 w-5 mr-2 ${iconClass}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent class={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
}
