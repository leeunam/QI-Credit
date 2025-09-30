import { X, CheckCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsPanel = ({
  open,
  onOpenChange,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsPanelProps) => {
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-h3">Notificações</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-body-3 text-muted-foreground">
                {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
              </span>
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-body-2 text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    notification.read
                      ? 'bg-background hover:bg-muted/50'
                      : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                  }`}
                  onClick={() => !notification.read && onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-body-3 text-foreground flex-1">
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-body-4 text-muted-foreground mt-1">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
