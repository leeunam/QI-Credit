import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CustomButton } from '../components/ui/button-variants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart3, Users, TrendingUp, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const stats = [
    {
      title: "Total de Usuários",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Receita Mensal",
      value: "R$ 45.231",
      change: "+23%",
      icon: TrendingUp,
      color: "text-success"
    },
    {
      title: "Conversões",
      value: "1,234",
      change: "+8%",
      icon: BarChart3,
      color: "text-secondary"
    },
    {
      title: "Atividade",
      value: "89%",
      change: "+5%",
      icon: Activity,
      color: "text-info"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="text-h4 font-bold text-primary">
              Dashboard
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-body-4 text-muted-foreground">
                Bem-vindo, <strong>{user?.name}</strong>
              </span>
              <CustomButton variant="outline" onClick={logout}>
                Sair
              </CustomButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-h2 font-bold text-foreground mb-2">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-body-2 text-muted-foreground">
            Aqui está um resumo das suas atividades recentes.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover:shadow-elegant transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-body-4 font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-h3 font-bold text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-success">
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Atividade Recente</CardTitle>
            <CardDescription>
              Suas últimas ações na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <p className="text-body-3 font-medium">Login realizado com sucesso</p>
                  <p className="text-body-4 text-muted-foreground">Há 2 minutos</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-info rounded-full"></div>
                <div className="flex-1">
                  <p className="text-body-3 font-medium">Perfil atualizado</p>
                  <p className="text-body-4 text-muted-foreground">Há 1 hora</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <div className="flex-1">
                  <p className="text-body-3 font-medium">Relatório gerado</p>
                  <p className="text-body-4 text-muted-foreground">Há 3 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};