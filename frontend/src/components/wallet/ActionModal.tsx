import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useWallet } from '../../contexts/walletContext';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'add' | 'withdraw' | 'transfer' | null;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  action
}) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const { addMoney, withdrawMoney, transferMoney, isLoading } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    
    if (!numericAmount || numericAmount <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido",
        variant: "destructive"
      });
      return;
    }

    let success = false;
    
    try {
      switch (action) {
        case 'add':
          success = await addMoney(numericAmount, description || 'Depósito');
          break;
        case 'withdraw':
          success = await withdrawMoney(numericAmount, description || 'Saque');
          break;
        case 'transfer':
          if (!recipient.trim()) {
            toast({
              title: "Erro",
              description: "Por favor, informe o destinatário",
              variant: "destructive"
            });
            return;
          }
          success = await transferMoney(numericAmount, recipient, description);
          break;
      }

      if (success) {
        toast({
          title: "Sucesso",
          description: getSuccessMessage(),
          variant: "default"
        });
        onClose();
        resetForm();
      } else {
        toast({
          title: "Erro",
          description: getErrorMessage(),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };

  const getSuccessMessage = () => {
    switch (action) {
      case 'add':
        return 'Dinheiro adicionado com sucesso!';
      case 'withdraw':
        return 'Saque realizado com sucesso!';
      case 'transfer':
        return 'Transferência realizada com sucesso!';
      default:
        return 'Operação realizada com sucesso!';
    }
  };

  const getErrorMessage = () => {
    switch (action) {
      case 'withdraw':
      case 'transfer':
        return 'Saldo insuficiente';
      default:
        return 'Falha na operação';
    }
  };

  const getTitle = () => {
    switch (action) {
      case 'add':
        return 'Adicionar dinheiro';
      case 'withdraw':
        return 'Sacar dinheiro';
      case 'transfer':
        return 'Transferir dinheiro';
      default:
        return '';
    }
  };

  const resetForm = () => {
    setAmount('');
    setRecipient('');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-h3 font-display">{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-body-3 font-medium">
              Valor (R$)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="text-body-3"
            />
          </div>

          {action === 'transfer' && (
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-body-3 font-medium">
                Destinatário
              </Label>
              <Input
                id="recipient"
                type="text"
                placeholder="Nome ou email do destinatário"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                className="text-body-3"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-body-3 font-medium">
              Descrição (opcional)
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Descrição da transação"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-body-3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 'Confirmar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};