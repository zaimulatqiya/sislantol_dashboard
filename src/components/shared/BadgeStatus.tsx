import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from '@/lib/constants';
import { StatusLaporan } from '@/types';
import { cn } from '@/lib/utils';

interface BadgeStatusProps {
  status: StatusLaporan;
  className?: string;
}

export function BadgeStatus({ status, className }: BadgeStatusProps) {
  const config = STATUS_CONFIG[status];
  
  if (!config) {
    return <Badge variant="outline">Unknown</Badge>;
  }

  return (
    <Badge className={cn("font-medium", config.color, className)} variant="outline">
      {config.label}
    </Badge>
  );
}
