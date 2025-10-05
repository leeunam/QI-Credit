import { useState } from 'react';
import { Header2 } from '@/components/layout/Header2';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { ActivityItem } from '@/components/dashboard/ActivityItem';
import { EscrowStatusCard } from '@/components/dashboard/EscrowStatusCard';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard, UserRole } from '@/hooks/useDashboard';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
  const [userRole] = useState<UserRole>('investor');
  const { data, loading, error } = useDashboard(userRole);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { toast } = useToast();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-error text-center">{error}</p>
            <Button className="w-full mt-4" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header2 />
      <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left sidebar - Profile info */}
            <aside className="lg:col-span-3 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-body-4 text-muted-foreground">Perfil</span>
                    <span className="text-body-3 font-medium capitalize">{userRole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-4 text-muted-foreground">Risco</span>
                    <span className="text-body-3 font-medium">{data?.riskProfile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-4 text-muted-foreground">KYC</span>
                    <span className="text-body-3 font-medium text-success capitalize">
                      {data?.kycStatus}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Button variant="link" className="w-full text-body-4">
                Como funciona P2P?
              </Button>
            </aside>

            {/* Main content */}
            <section className="lg:col-span-6 space-y-6">
              {/* Wallet card */}
              <WalletCard
                balance={data?.balance || 0}
                onViewWallet={() => navigate('/wallet')}
              />

              {/* Activity feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-body-2">Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data?.activities.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      {...activity}
                      onActionClick={() =>
                        toast({ title: 'Detalhes', description: 'Em desenvolvimento' })
                      }
                    />
                  ))}
                  <Button variant="link" className="w-full mt-4">
                    Carregar mais
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Right sidebar - Info panel */}
            <aside className="lg:col-span-3 space-y-4">
              {data?.escrow && (
                <EscrowStatusCard
                  {...data.escrow}
                  onViewDetails={() => navigate('/smart-contract/:id')}
                />
              )}

              {data?.kpis && <KPIGrid {...data.kpis} />}

              <Card>
                <CardHeader>
                  <CardTitle className="text-body-4">Notificações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {notifications.slice(0, 2).map((notif) => (
                    <div key={notif.id} className="p-2 bg-muted/50 rounded text-body-4">
                      {notif.message}
                    </div>
                  ))}
                  <Button
                    variant="link"
                    size="sm"
                    className="w-full"
                    onClick={() => setNotificationsOpen(true)}
                  >
                    Ver todas
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </main>

      {/* Modals */}
      <NotificationsPanel
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  );
}