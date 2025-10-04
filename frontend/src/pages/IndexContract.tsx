import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, PenTool, Shield, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header2 } from '@/components/layout/Header2'; 
import { useNotifications } from '@/hooks/useNotifications';
import { useState } from 'react';

const Index = () => {
  const features = [
    {
      icon: FileText,
      title: 'Contratos Digitais',
      description: 'Crie e gerencie contratos completamente digitais com validade jurídica'
    },
    {
      icon: PenTool,
      title: 'Assinatura Eletrônica',
      description: 'Assine documentos de forma segura usando assinatura digital'
    },
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Certificação digital e criptografia para máxima segurança'
    },
    {
      icon: Users,
      title: 'Múltiplas Partes',
      description: 'Suporte para contratos com várias partes e assinantes'
    }
  ];

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header2
        balance={0} // passe o saldo real se tiver
        unreadNotifications={unreadCount}
        onNotificationsClick={() => setNotificationsOpen(true)}
        onProfileClick={() => console.log('Abrir perfil')}
        onLogout={() => console.log('Logout')}
      />

      {/* Todo: adicionar o componente NotificationsPanel controlado por notificationsOpen */}

      {/* Resto da tela */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-start">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-h1 font-display mb-6 text-foreground">
            Contrato Digital + Assinatura
          </h1>
          <p className="text-body-1 text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma completa para criação, visualização e assinatura digital de contratos 
            com validade jurídica e máxima segurança.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/contrato/1">
              <Button className="btn-primary">
                <FileText className="h-5 w-5 mr-2" />
                Ver Contrato Demo
              </Button>
            </Link>
            <Button variant="outline" className="btn-secondary">
              <PenTool className="h-5 w-5 mr-2" />
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-display mb-4">Funcionalidades Principais</h2>
            <p className="text-body-2 text-muted-foreground max-w-2xl mx-auto">
              Nossa plataforma oferece tudo que você precisa para digitalizar 
              seus processos contratuais de forma segura e eficiente.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-base text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-h4 font-display mb-2">{feature.title}</h3>
                <p className="text-body-3 text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="card-base p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-h2 font-display mb-4">
                    Experimente a Demonstração
                  </h2>
                  <p className="text-body-2 text-muted-foreground mb-6">
                    Veja como funciona nossa plataforma de contratos digitais. 
                    O demo inclui um contrato de prestação de serviços com 
                    duas partes para assinatura.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-body-3">Visualização completa do contrato</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-body-3">Assinatura digital com canvas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-body-3">Download em PDF</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-body-3">Histórico de assinaturas</span>
                    </div>
                  </div>
                  <Link to="/contrato/1">
                    <Button className="btn-primary">
                      Acessar Demo
                    </Button>
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-body-3 font-semibold">2 Partes</p>
                        <p className="text-body-4 text-muted-foreground">Contratante e Contratado</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-body-3 font-semibold">Contrato Real</p>
                        <p className="text-body-4 text-muted-foreground">Prestação de Serviços</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                        <PenTool className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-body-3 font-semibold">Assinatura Digital</p>
                        <p className="text-body-4 text-muted-foreground">Canvas interativo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-body-3">
            © 2024 Contrato Digital + Assinatura. Desenvolvido com Lovable.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
