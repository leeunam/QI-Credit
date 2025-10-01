import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus, ArrowUpRight, QrCode } from 'lucide-react';

interface QuickActionsProps {
  onAddMoney: () => void;
  onWithdraw: () => void;
  onTransfer: () => void;
  onScanQR: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddMoney,
  onWithdraw,
  onTransfer,
  onScanQR
}) => {
  const actions = [
    {
      icon: Plus,
      label: 'Adicionar',
      color: 'bg-success',
      onClick: onAddMoney
    },
    {
      icon: Minus,
      label: 'Sacar',
      color: 'bg-warning',
      onClick: onWithdraw
    },
    {
      icon: ArrowUpRight,
      label: 'Transferir',
      color: 'bg-secondary',
      onClick: onTransfer
    },
    {
      icon: QrCode,
      label: 'QR Code',
      color: 'bg-info',
      onClick: onScanQR
    }
  ];

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <h3 className="text-h4 font-display font-semibold mb-4">Ações rápidas</h3>
        <div className="grid grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className={`${action.color} p-3 rounded-full`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <span className="text-body-4 text-center font-medium">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};