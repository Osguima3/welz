import { UIColor } from '@shared/schema/Color.ts';
import { LucideIcon } from 'lucide';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  color?: UIColor;
  iconColor?: UIColor;
  textColor?: UIColor;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

function getBackgroundColorClass(color: UIColor): string {
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

function getTextColorClass(color: UIColor): string {
  const iconColorMap: Record<UIColor, string> = {
    clear: '',
    muted: '',
    primary: '',
    secondary: 'text-secondary',
    destructive: 'text-destructive',
    success: 'text-success',
  };

  return iconColorMap[color];
}

export default function StatCard({
  icon: Icon,
  title,
  value,
  color = 'clear',
  iconColor: iconColor = color,
  textColor = color,
  className = '',
  headerClassName = 'pb-4',
  contentClassName = 'p-6',
}: StatCardProps) {
  const backgroundClass = getBackgroundColorClass(color);
  const iconClass = getIconColorClass(iconColor);
  const textClass = getTextColorClass(textColor);

  return (
    <Card class={`${backgroundClass} ${className}`}>
      <CardHeader class={headerClassName}>
        <CardTitle>
          <Icon class={`h-5 w-5 mr-2 ${iconClass}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent class={`text-3xl font-bold pt-0 ${textClass} ${contentClassName}`}>
        {value}
      </CardContent>
    </Card>
  );
}
