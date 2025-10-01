import { useState } from 'react';
import { PlusCircle, Search, TrendingUp } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { OfferCard } from '@/components/dashboard/OfferCard';
import { LoanCard } from '@/components/dashboard/LoanCard';
import { ScoreWidget } from '@/components/dashboard/ScoreWidget';
import { ActivityItem } from '@/components/dashboard/ActivityItem';
import { EscrowStatusCard } from '@/components/dashboard/EscrowStatusCard';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { InvestModal } from '@/components/dashboard/InvestModal';
import { DepositModal } from '@/components/dashboard/DepositModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard, UserRole } from '@/hooks/useDashboard';
import { useInvest } from '@/hooks/useInvest';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [userRole] = useState<UserRole>('investor'); // Change to 'borrower' to test borrower view
  const { data, loading, error } = useDashboard(userRole);
  const { createHold } = useInvest();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { toast } = useToast();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const handleInvest = (offerId: string, amount: number) => {
    const offer = data?.marketplaceOffers.find((o) => o.id === offerId);
    if (offer) {
      setSelectedOffer(offer);
      setInvestModalOpen(true);
    }
  };

  const handleConfirmInvest = async (offerId: string, amount: number) => {
    const hold = await createHold(offerId, amount);
    toast({
      title: 'Investimento confirmado',
      description: `Hold criado: ${hold.holdId}`,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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
      <Header
        balance={data?.balance || 0}
        unreadNotifications={unreadCount}
        onNotificationsClick={() => setNotificationsOpen(true)}
        onProfileClick={() => toast({ title: 'Perfil', description: 'Em desenvolvimento' })}
        onLogout={() => toast({ title: 'Logout', description: 'Saindo...' })}
      />

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
            {/* Left sidebar - Quick actions */}
            <aside className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-body-2">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userRole === 'investor' ? (
                    <>
                      <Button className="w-full" onClick={() => setDepositModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Depositar
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Search className="mr-2 h-4 w-4" />
                        Explorar Ofertas
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Solicitar Crédito
                      </Button>
                      <Button variant="outline" className="w-full">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Ver Ofertas
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

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
              {/* Overview cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WalletCard
                  balance={data?.balance || 0}
                  onViewWallet={() =>
                    toast({ title: 'Carteira', description: 'Em desenvolvimento' })
                  }
                />

                {userRole === 'investor' && data?.investments && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-body-2">Investimentos Ativos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-body-4 text-muted-foreground">Ativos</span>
                        <span className="text-h4 font-bold">{data.investments.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body-4 text-muted-foreground">Investido</span>
                        <span className="text-body-3 font-semibold">
                          {formatCurrency(data.investments.totalInvested)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body-4 text-muted-foreground">IRR esperado</span>
                        <span className="text-body-3 font-semibold text-success">
                          {data.investments.expectedIRR}%
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        Ver detalhes
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {userRole === 'borrower' && data?.loans && (
                  <LoanCard
                    outstandingPrincipal={data.loans.outstandingPrincipal}
                    nextDueDate={data.loans.nextDueDate}
                    nextInstallment={data.loans.nextInstallment}
                    onPayInstallment={() =>
                      toast({ title: 'Pagamento', description: 'Em desenvolvimento' })
                    }
                  />
                )}
              </div>

              {/* Main panel */}
              {userRole === 'investor' ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-body-2">Marketplace Snapshot</CardTitle>
                    <Button variant="link" size="sm">
                      Ver todas as ofertas
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {data?.marketplaceOffers.slice(0, 3).map((offer) => (
                        <OfferCard key={offer.id} {...offer} onInvest={handleInvest} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                data?.creditScore && (
                  <ScoreWidget
                    score={data.creditScore}
                    onViewHistory={() =>
                      toast({ title: 'Histórico', description: 'Em desenvolvimento' })
                    }
                  />
                )
              )}

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
                  onViewDetails={() =>
                    toast({ title: 'Escrow', description: 'Em desenvolvimento' })
                  }
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

      <InvestModal
        open={investModalOpen}
        onOpenChange={setInvestModalOpen}
        offer={selectedOffer}
        onConfirm={handleConfirmInvest}
      />

      <DepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} />
    </div>
  );
}

