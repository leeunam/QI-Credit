import { FileText, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityItemProps {
  type: 'deposit' | 'contract' | 'payment' | 'alert';
  title: string;
  timestamp: string;
  actionLink?: string;
  onActionClick?: () => void;
}

const icons = {
  deposit: DollarSign,
  contract: FileText,
  payment: CheckCircle,
  alert: AlertCircle,
};

const colors = {
  deposit: 'text-success bg-success/10',
  contract: 'text-info bg-info/10',
  payment: 'text-primary bg-primary/10',
  alert: 'text-warning bg-warning/10',
};

export const ActivityItem = ({
  type,
  title,
  timestamp,
  actionLink,
  onActionClick,
}: ActivityItemProps) => {
  const Icon = icons[type];

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Há alguns minutos';
    if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`p-2 rounded-full ${colors[type]}`}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-body-3 font-medium text-foreground truncate">{title}</p>
        <p className="text-body-4 text-muted-foreground">{formatTimestamp(timestamp)}</p>
      </div>

      {actionLink && (
        <Button variant="ghost" size="sm" onClick={onActionClick}>
          Ver
        </Button>
      )}
    </div>
  );
};
