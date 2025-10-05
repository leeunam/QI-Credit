import { useState, useEffect } from 'react';
import { MarketplaceFilters } from '@/components/MarketplaceFilters';
import { OfferCard } from '@/components/OfferCard';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter, TrendingUp, ArrowLeft } from 'lucide-react';
import {
  getCreditOffers,
  type CreditOffer,
  type MarketplaceFilters as FilterType,
} from '@/services/marketplaceService';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Header2 } from '@/components/layout/Header2';

/**
 * Página de Marketplace P2P
 * Exibe ofertas de crédito para investidores com filtros personalizáveis
 */
export default function Marketplace() {
  const [offers, setOffers] = useState<CreditOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterType>({});
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Detecta tamanho da tela para layout responsivo
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Carrega ofertas iniciais
  useEffect(() => {
    loadOffers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOffers = async (newFilters?: FilterType) => {
    setLoading(true);
    try {
      // TODO: Substituir por chamada real à API quando backend estiver pronto
      const data = await getCreditOffers(newFilters);
      setOffers(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar ofertas. Tente novamente.',
      });
      console.error('Erro ao carregar ofertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    loadOffers(newFilters);
    toast({
      title: 'Sucesso',
      description: 'Filtros aplicados com sucesso!',
    });
  };

  const handleClearFilters = () => {
    setFilters({});
    loadOffers({});
    toast({
      title: 'Filtros removidos',
      description: 'Todos os filtros foram removidos.',
    });
  };

  const handleInvest = (offerId: string) => {
    // TODO: Implementar lógica de investimento quando backend estiver pronto
    toast({
      title: 'Investimento',
      description: `Redirecionando para investimento na oferta ${offerId}...`,
    });
    console.log('Investir em oferta:', offerId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header2/>
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 desktop-sm:py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-h1 text-card-foreground">Marketplace P2P</h1>
          </div>
          <p className="text-body-2 text-muted-foreground">
            Invista em ofertas de crédito e diversifique seu portfólio
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 desktop-sm:py-8">
        <div className="flex flex-col desktop-sm:flex-row gap-6">
          {/* Filtros - Desktop */}
          {!isMobile && (
            <aside className="desktop-sm:w-80 desktop-sm:shrink-0">
              <div className="sticky top-6">
                <MarketplaceFilters
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </aside>
          )}

          {/* Lista de Ofertas */}
          <div className="flex-1">
            {/* Header da lista com filtros mobile */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-h3 text-foreground mb-1">
                  Ofertas Disponíveis
                </h2>
                <p className="text-body-3 text-muted-foreground">
                  {loading
                    ? 'Carregando...'
                    : `${offers.length} ${
                        offers.length === 1
                          ? 'oferta encontrada'
                          : 'ofertas encontradas'
                      }`}
                </p>
              </div>

              {/* Botão de filtros - Mobile */}
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-full sm:w-96 overflow-y-auto"
                  >
                    <MarketplaceFilters
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                      isMobile={true}
                    />
                  </SheetContent>
                </Sheet>
              )}
            </div>

            {/* Grid de Ofertas */}
            {loading ? (
              <div className="grid gap-6 mobile:grid-cols-1 desktop-sm:grid-cols-2 desktop-md:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-96 bg-card rounded-lg border border-border animate-pulse"
                  />
                ))}
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-h3 text-foreground mb-2">
                  Nenhuma oferta encontrada
                </h3>
                <p className="text-body-3 text-muted-foreground mb-4">
                  Tente ajustar os filtros para ver mais resultados
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 mobile:grid-cols-1 desktop-sm:grid-cols-2 desktop-lg:grid-cols-3">
                {offers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onInvest={handleInvest}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
